import { buildLogger } from '../../../libs/logger';
import googleSheets from '../../../providers/googleSheets';
import database from '../../../providers/database';

import {
  services,
  getAssetValueFromBalance,
  hasFunds,
  swapOnAsset,
} from './common';

import getBalance from './getBalance';
import getShares from './getShares';
import deposit from './deposit';
import transfer from './transfer';

import moveToPortfolio from './moveToPortfolio';

import getPortfolios from './getPortfolios';

const log = buildLogger('Portfolios');

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
  const fixedAssets = await services['fixed'].getAssetsList();
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
  moveToPortfolio,
  getAssets,
  removeAsset,
  getPortfolios,

  // debug/dev
  updateAbsoluteTable,
  updateSharesDiffTable,
  updateTables,
};
