import { buildLogger } from '../../../libs/logger';
import googleSheets from '../../../providers/googleSheets';
import database from '../../../providers/database';
import fixedService from '../../fixed/fixed.service';
import stockService from '../../stock/stock.service';
import cryptoService from '../../crypto/crypto.service';

import { getPortfolioData, isAround0, isAround1, isNegative } from './common';

import getBalance from './getBalance';
import getShares from './getShares';

import getPortfolios from './getPortfolios';

const log = buildLogger('Portfolios');

const services = {
  fixed: fixedService,
  stock: stockService,
  crypto: cryptoService,
};

const verifyShares = shares => {
  const sum = shares.reduce((acc, current) => acc + current, 0);

  if (!isAround1(sum) && !isAround0(sum))
    throw new Error(`Sum of shares is not 1: current value ${sum}`);
};

const depositValueToAsset = async ({ assetClass, assetName, value }) => {
  const service = services[assetClass];
  await service.deposit({ asset: assetName, value });
};

const addValuesToPortfolioList = (shares, totalAssetValue) =>
  shares.map(({ portfolio, value }) => ({
    portfolio,
    share: value,
    value: value * totalAssetValue,
  }));

const addValueToPortfolioItem = (portfolioList, portfolioName, value) => {
  let portfolioItem = portfolioList.find(
    item => item.portfolio === portfolioName
  );

  if (!portfolioItem) {
    portfolioItem = { portfolio: portfolioName, share: 1, value };
    portfolioList.push(portfolioItem);
  } else {
    portfolioItem.value = portfolioItem.value + value;
  }

  if (portfolioItem.value < 0) {
    return { status: 'notEnoughFunds' };
  }

  return { status: 'ok' };
};

const deposit = async ({
  value,
  portfolio,
  assetClass,
  assetName,
  executed,
}) => {
  if (assetClass === 'stock') assetName = 'float';

  const service = services[assetClass];
  const totalAssetValue = await service.getTotalPosition(assetName);
  const currentTotalAssetValue = executed
    ? totalAssetValue - value
    : totalAssetValue;
  const newTotalAssetValue = currentTotalAssetValue + value;

  const portfolioData = await getPortfolioData({ assetClass, assetName });

  const asset = portfolioData.length
    ? portfolioData[0]
    : { assetClass, assetName, shares: [] };

  const portfolioList = addValuesToPortfolioList(
    asset.shares,
    currentTotalAssetValue
  );

  const { status: addValueStatus } = addValueToPortfolioItem(
    portfolioList,
    portfolio,
    value
  );

  if (addValueStatus !== 'ok') {
    return { status: addValueStatus };
  }

  const newShares = portfolioList.map(item => ({
    portfolio: item.portfolio,
    value: newTotalAssetValue !== 0 ? item.value / newTotalAssetValue : 0,
  }));

  verifyShares(newShares.map(({ value }) => value));

  await Promise.all([
    database.updateOne(
      'portfolio',
      'shares',
      { assetClass, assetName },
      { $setOnInsert: { assetClass, assetName }, $set: { shares: newShares } },
      { upsert: true }
    ),
    depositValueToAsset({
      assetClass,
      assetName,
      value,
    }),
  ]);

  return { status: 'ok' };
};

const getAssetValueFromBalance = ({ balance }, assetClass, assetName) => {
  const assetItem = balance[assetClass].balance.find(
    item => item.asset === assetName
  );
  return assetItem ? assetItem.value : 0;
};

const hasFunds = (balance, asset, value) => {
  const currentValue = getAssetValueFromBalance(
    balance,
    asset.class,
    asset.name
  );
  return currentValue - value >= 0;
};

const transfer = async ({
  value,
  portfolio,
  origin,
  destiny,
  originExecuted,
  destinyExecuted,
}) => {
  const originBalance = await getBalance(portfolio);

  const transferValue =
    value === 'all'
      ? getAssetValueFromBalance(originBalance, origin.class, origin.name)
      : value;
  const hasOriginFunds = hasFunds(originBalance, origin, transferValue);

  if (!hasOriginFunds) {
    return { status: 'notEnoughFunds' };
  }

  await deposit({
    value: -transferValue,
    portfolio,
    assetClass: origin.class,
    assetName: origin.name,
    executed: originExecuted,
  });
  await deposit({
    value: transferValue,
    portfolio,
    assetClass: destiny.class,
    assetName: destiny.name,
    executed: destinyExecuted,
  });

  return { status: 'ok' };
};

const swapOnAsset = async ({
  value,
  assetClass,
  assetName,
  origin,
  destiny,
}) => {
  const service = services[assetClass];
  const totalAssetValue = await service.getTotalPosition(assetName);

  const portfolioData = await getPortfolioData();

  const asset = portfolioData.find(
    item => item.assetClass === assetClass && item.assetName === assetName
  );

  let originPortfolio = asset.shares.find(
    ({ portfolio }) => portfolio === origin
  );
  if (!originPortfolio) {
    originPortfolio = { portfolio: origin, value: 0 };
    asset.shares.push(originPortfolio);
  }

  let destinyPortfolio = asset.shares.find(
    ({ portfolio }) => portfolio === destiny
  );
  if (!destinyPortfolio) {
    destinyPortfolio = { portfolio: destiny, value: 0 };
    asset.shares.push(destinyPortfolio);
  }

  const deltaShare = value / totalAssetValue;

  originPortfolio.value = originPortfolio.value - deltaShare;
  destinyPortfolio.value = destinyPortfolio.value + deltaShare;

  const hasOriginFunds = !isNegative(originPortfolio.value);
  const hasDestinyFinds = !isNegative(destinyPortfolio.value);

  if (!hasOriginFunds || !hasDestinyFinds) {
    if (!hasOriginFunds) {
      log(`Not enough funds on ${origin} (${assetClass}/${assetName})`, {
        severity: 'warn',
      });
    }

    if (!hasDestinyFinds) {
      log(`Not enough funds on ${destiny} (${assetClass}/${assetName})`, {
        severity: 'warn',
      });
    }

    return { status: 'notEnoughFunds' };
  }

  verifyShares(asset.shares.map(({ value }) => value));

  await database.updateOne(
    'portfolio',
    'shares',
    { assetClass, assetName },
    { $set: { shares: asset.shares } }
  );

  return { status: 'ok' };
};

const swap = async ({
  value,
  portfolio,
  asset,
  origin,
  destiny,
  liquidity,
}) => {
  const withinSamePortfolio = portfolio && !asset;

  const params = {};

  if (withinSamePortfolio) {
    // portfolio is constant
    // another portfolio is the liquidity
    // different assets are the origin and destiny
    params.assets = [origin, destiny];
    params.originPortfolio = portfolio;
    params.destinyPortfolio = liquidity;
  } else {
    // withinSameAsset
    // asset is constant
    // another asset is the liquidity
    // different portfolios are the origin and destiny
    params.assets = [asset, liquidity];
    params.originPortfolio = origin;
    params.destinyPortfolio = destiny;
  }

  // TODO get balances in a single call
  const [originBalance, liquidityBalance] = await Promise.all([
    getBalance(params.originPortfolio),
    getBalance(params.destinyPortfolio),
  ]);

  const swapValue =
    value === 'all'
      ? getAssetValueFromBalance(
          originBalance,
          params.assets[0].class,
          params.assets[0].name
        )
      : value;

  const hasOriginFunds = hasFunds(originBalance, params.assets[0], swapValue);
  const hasLiquidityFunds = hasFunds(
    liquidityBalance,
    params.assets[1],
    swapValue
  );

  if (!hasOriginFunds || !hasLiquidityFunds) {
    return { status: 'notEnoughFunds' };
  }

  await Promise.all([
    await swapOnAsset({
      value: swapValue,
      assetClass: params.assets[0].class,
      assetName: params.assets[0].name,
      origin: params.originPortfolio,
      destiny: params.destinyPortfolio,
    }),
    await swapOnAsset({
      value: -swapValue,
      assetClass: params.assets[1].class,
      assetName: params.assets[1].name,
      origin: params.originPortfolio,
      destiny: params.destinyPortfolio,
    }),
  ]);

  return { status: 'ok' };
};

const getAssets = () =>
  database.find(
    'portfolio',
    'shares',
    {},
    { projection: { _id: 0, shares: 0 } }
  );

const removeAsset = async ({ assetClass, assetName }) => {
  if (assetClass !== 'fixed') {
    log(`removeAsset not implemented for ${assetClass} assets`, {
      severity: 'error',
    });
  }

  const service = services[assetClass];
  const { status } = await service.removeAsset(assetName);

  if (status !== 'ok') {
    return { status };
  }

  await database.deleteOne('portfolio', 'shares', {
    assetClass,
    assetName,
  });

  return { status: 'ok' };
};

const flattenBalance = (balance, totals) =>
  balance.reduce((values, { asset, value }) => {
    values[asset] = value;
    totals[asset] = totals[asset] + value;
    return values;
  }, {});

const updateAbsoluteTable = async () => {
  const fixedAssets = await fixedService.getAssetsList();
  const stockAssets = ['float', 'br', 'fii', 'us'];
  const cryptoAssets = ['binanceBuffer', 'hodl', 'defi', 'defi2', 'backed'];
  const assets = [...fixedAssets, ...stockAssets, ...cryptoAssets];
  const header = ['portfolios', ...assets, 'total'];

  const { balance } = await getBalance();

  const totalRow = assets.reduce(
    (totalRow, asset) => {
      totalRow[asset] = 0;
      return totalRow;
    },
    { portfolios: 'total', total: 0 }
  );

  const rows = Object.entries(balance).map(
    ([portfolio, { balance, total }]) => {
      const fixedValues = flattenBalance(balance.fixed.balance, totalRow);
      const stockValues = flattenBalance(balance.stock.balance, totalRow);
      const cryptoValues = flattenBalance(balance.crypto.balance, totalRow);

      totalRow.total = totalRow.total + total;
      return {
        portfolios: portfolio,
        ...fixedValues,
        ...stockValues,
        ...cryptoValues,
        total,
      };
    }
  );

  await googleSheets.setSheet('portfolio-absolute', header, [
    ...rows,
    totalRow,
  ]);
};

const updateSharesDiffTable = async () => {
  const { shares: portfolios } = await getShares();

  const header = ['portfolios'];

  const rows = portfolios.map(({ shares, portfolio }) => {
    const row = [portfolio];
    shares.forEach(share => {
      const { assetClass, asset, diffBRL } = share;
      const headerLabel = asset || assetClass;
      const colIndex = header.indexOf(headerLabel);

      if (colIndex !== -1) {
        row[colIndex] = -diffBRL;
      } else {
        row[header.length] = -diffBRL;
        header.push(headerLabel);
      }
    });

    return row;
  });

  await googleSheets.setSheet('portfolio-shares-diff', header, rows);
};

const updateTables = () =>
  Promise.all([updateAbsoluteTable(), updateSharesDiffTable()]);

export default {
  getBalance,
  getShares,
  deposit,
  transfer,
  swap,
  getAssets,
  removeAsset,
  getPortfolios,

  // debug/dev
  updateAbsoluteTable,
  updateSharesDiffTable,
  updateTables,
};
