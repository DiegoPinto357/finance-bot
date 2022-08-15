import googleSheets from '../../providers/googleSheets';
import database from '../../providers/database';
import fixedService from '../fixed/fixed.service';
import stockService from '../stock/stock.service';
import cryptoService from '../crypto/crypto.service';

const services = {
  fixed: fixedService,
  stock: stockService,
  crypto: cryptoService,
};

const getPortfolioData = () =>
  database.find('portfolio', 'shares', {}, { projection: { _id: 0 } });

const getAssetsList = assets =>
  assets ? assets.map(({ asset }) => asset) : [];

const filterAssets = (balance, assets) => {
  const assetList = getAssetsList(assets);
  return balance.filter(item => assetList.includes(item.asset));
};

const getAssetShare = (assets, assetName) =>
  assets.find(item => item.asset === assetName).share;

const mapValuesByShares = (assetsWithTotalValues, assetsWithShares) =>
  assetsWithTotalValues.map(item => {
    return {
      asset: item.asset,
      value: item.value * getAssetShare(assetsWithShares, item.asset),
    };
  });

const getFixedValues = (fixedTotalBalance, assets) => {
  const { balance } = fixedTotalBalance;
  const totalAssetValues = filterAssets(balance, assets);
  return mapValuesByShares(totalAssetValues, assets);
};

const getStockValues = (stockTotalBalance, assets) => {
  const balance = Object.entries(stockTotalBalance).map(([asset, value]) => ({
    asset,
    value,
  }));
  const totalAssetValues = filterAssets(balance, assets);
  return mapValuesByShares(totalAssetValues, assets);
};

const getCryptoValues = (cryptoTotalBalance, assets) => {
  const balance = Object.entries(cryptoTotalBalance).map(([asset, value]) => ({
    asset,
    value,
  }));
  const totalAssetValues = filterAssets(balance, assets);
  return mapValuesByShares(totalAssetValues, assets);
};

const getAssetsDataFromPortfolio = portfolio =>
  portfolio.reduce((obj, item) => {
    let assetClass = obj[item.class];
    if (!assetClass) {
      assetClass = [];
      obj[item.class] = assetClass;
    }
    assetClass.push({ asset: item.asset, share: item.share });
    return obj;
  }, {});

const getAssetsFromPortfolioName = (portfolios, portfolioName) => {
  const portfolio = portfolios
    .map(item => {
      const portfolioShare = item.shares.find(
        share => share.portfolio === portfolioName
      );
      return {
        class: item.assetClass,
        asset: item.assetName,
        share: portfolioShare ? portfolioShare.value : 0,
      };
    })
    .filter(item => !portfolioName || item.share);

  return getAssetsDataFromPortfolio(portfolio);
};

const getTotalValue = assetValues =>
  assetValues.reduce((total, current) => total + current.value, 0);

const getBalancesByAssets = (assets, totalBalances) => {
  const fixedBalance = assets.fixed
    ? getFixedValues(totalBalances.fixed, assets.fixed)
    : [];
  const stockBalance = assets.stock
    ? getStockValues(totalBalances.stock, assets.stock)
    : [];
  const cryptoBalance = assets.crypto
    ? getCryptoValues(totalBalances.crypto, assets.crypto)
    : [];

  const totals = {
    fixed: getTotalValue(fixedBalance),
    stock: getTotalValue(stockBalance),
    crypto: getTotalValue(cryptoBalance),
  };

  const balance = {
    fixed: { balance: fixedBalance, total: totals.fixed },
    stock: { balance: stockBalance, total: totals.stock },
    crypto: { balance: cryptoBalance, total: totals.crypto },
  };

  return {
    balance,
    total: totals.fixed + totals.stock + totals.crypto,
  };
};

const getBalance = async portfolioName => {
  const portfolios = await getPortfolioData();

  const assets = getAssetsFromPortfolioName(portfolios, portfolioName);

  const [fixedTotalBalance, stockTotalBalance, cryptoTotalBalance] =
    await Promise.all([
      assets.fixed ? fixedService.getBalance() : { balance: [], total: 0 },
      assets.stock ? stockService.getTotalPosition() : { total: 0 },
      assets.crypto ? cryptoService.getTotalPosition() : { total: 0 },
    ]);

  if (portfolioName && !Array.isArray(portfolioName)) {
    return getBalancesByAssets(assets, {
      fixed: fixedTotalBalance,
      stock: stockTotalBalance,
      crypto: cryptoTotalBalance,
    });
  }

  let names;

  if (Array.isArray(portfolioName)) {
    names = portfolioName;
  } else {
    names = portfolios[0].shares.map(share => share.portfolio);
  }

  const balanceArray = await Promise.all(
    names.map(async portfolioName => {
      const currentAssets = getAssetsFromPortfolioName(
        portfolios,
        portfolioName
      );

      return {
        [portfolioName]: getBalancesByAssets(currentAssets, {
          fixed: fixedTotalBalance,
          stock: stockTotalBalance,
          crypto: cryptoTotalBalance,
        }),
      };
    })
  );

  const { balance, total } = balanceArray.reduce(
    ({ balance, total }, item) => ({
      balance: { ...balance, ...item },
      total: total + Object.values(item)[0].total,
    }),
    { balance: {}, total: 0 }
  );

  return {
    balance,
    total,
  };
};

const getShares = async portfolioName => {
  const sharesSheetTitle = `portfolio-${portfolioName}-shares`;
  const [{ balance, total }, portfolioShares] = await Promise.all([
    getBalance(portfolioName),
    googleSheets.loadSheet(sharesSheetTitle),
  ]);

  const balanceFlat = [
    ...balance.fixed.balance.map(item => ({ assetClass: 'fixed', ...item })),
    ...balance.stock.balance.map(item => ({ assetClass: 'stock', ...item })),
    ...balance.crypto.balance.map(item => ({ assetClass: 'crypto', ...item })),
  ];

  const shares = portfolioShares.reduce((result, shareItem) => {
    let asset;

    if (!shareItem.asset) {
      const assetsByClass = balanceFlat.filter(
        item => shareItem.assetClass === item.assetClass
      );
      const value = getTotalValue(assetsByClass);
      asset = {
        assetClass: shareItem.assetClass,
        asset: shareItem.assetClass,
        value,
        targetShare: shareItem.targetShare,
      };
    } else {
      asset = {
        ...balanceFlat.find(
          item =>
            shareItem.assetClass === item.assetClass &&
            shareItem.asset === item.asset
        ),
        targetShare: shareItem.targetShare,
      };
    }

    const currentShare = asset.value / total;
    const diffBRL = asset.targetShare * total - asset.value;

    result.push({ ...asset, currentShare, diffBRL });
    return result;
  }, []);

  return {
    shares: shares.sort((a, b) => b.diffBRL - a.diffBRL),
    total,
  };
};

const setAssetValue = async ({ assetClass, assetName, value }) => {
  const service = services[assetClass];
  await service.setAssetValue({ asset: assetName, value });
};

const deposit = async ({ value, portfolio, assetClass, assetName }) => {
  const service = services[assetClass];
  const currentTotalAssetValue = await service.getTotalPosition(assetName);
  const newTotalAssetValue = currentTotalAssetValue + value;

  const portfolioData = await getPortfolioData();
  const asset = portfolioData.find(
    item => item.assetClass === assetClass && item.assetName === assetName
  );

  const portfolioList = asset.shares.map(({ portfolio, value }) => ({
    portfolio,
    share: value,
    value: value * currentTotalAssetValue,
  }));

  const portfolioItem = portfolioList.find(
    item => item.portfolio === portfolio
  );

  portfolioItem.value = portfolioItem.value + value;

  if (portfolioItem.value < 0) {
    return { status: 'notEnoughFunds' };
  }

  const newShares = portfolioList.map(item => ({
    portfolio: item.portfolio,
    value: item.value / newTotalAssetValue,
  }));

  await Promise.all([
    database.updateOne(
      'portfolio',
      'shares',
      { assetClass, assetName },
      { $set: { shares: newShares } }
    ),
    // TODO for stock and crypto, needs to set the float value (use "deposit" method for all asset classes)
    setAssetValue({ assetClass, assetName, value: newTotalAssetValue }),
  ]);

  return { status: 'ok' };
};

const getAssetValueFromBalance = ({ balance }, assetClass, assetName) =>
  balance[assetClass].balance.find(item => item.asset === assetName).value;

const hasFunds = (balance, asset, value) => {
  const currentValue = getAssetValueFromBalance(
    balance,
    asset.class,
    asset.name
  );
  return currentValue - value >= 0;
};

const transfer = async (value, { portfolio, origin, destiny }) => {
  const originBalance = await getBalance(portfolio);
  const hasOriginFunds = hasFunds(originBalance, origin, value);

  if (!hasOriginFunds) {
    return { status: 'notEnoughFunds' };
  }

  await Promise.all([
    deposit({
      value: -value,
      portfolio,
      assetClass: origin.class,
      assetName: origin.name,
    }),
    deposit({
      value,
      portfolio,
      assetClass: destiny.class,
      assetName: destiny.name,
    }),
  ]);

  return { status: 'ok' };
};

const swap = async (
  value,
  { portfolio, asset, origin, destiny, liquidity }
) => {
  const withinSamePortfolio = portfolio && !asset;

  const params = {
    origin: {},
    destiny: {},
    liquidityOrigin: {},
    liquidityDestiny: {},
  };

  if (withinSamePortfolio) {
    // portfolio is constant
    // another portfolio is the liquidity
    // different assets are the origin and destiny
    params.origin.portfolio = portfolio;
    params.origin.asset = origin;
    params.destiny.portfolio = portfolio;
    params.destiny.asset = destiny;
    params.liquidityOrigin.portfolio = liquidity;
    params.liquidityOrigin.asset = origin;
    params.liquidityDestiny.portfolio = liquidity;
    params.liquidityDestiny.asset = destiny;
  } else {
    // withinSameAsset
    // asset is constant
    // another asset is the liquidity
    // different portfolios are the origin and destiny
    params.origin.portfolio = origin;
    params.origin.asset = asset;
    params.destiny.portfolio = destiny;
    params.destiny.asset = asset;
    params.liquidityOrigin.portfolio = origin;
    params.liquidityOrigin.asset = liquidity;
    params.liquidityDestiny.portfolio = destiny;
    params.liquidityDestiny.asset = liquidity;
  }

  // TODO get balances in a single call
  const [originBalance, liquidityBalance] = await Promise.all([
    getBalance(params.origin.portfolio),
    getBalance(params.liquidityDestiny.portfolio),
  ]);

  const hasOriginFunds = hasFunds(originBalance, params.origin.asset, value);
  const hasLiquidityFunds = hasFunds(
    liquidityBalance,
    params.liquidityDestiny.asset,
    value
  );

  if (!hasOriginFunds || !hasLiquidityFunds) {
    return { status: 'notEnoughFunds' };
  }

  await Promise.all([
    deposit({
      value: -value,
      portfolio: params.origin.portfolio,
      assetClass: params.origin.asset.class,
      assetName: params.origin.asset.name,
    }),
    deposit({
      value,
      portfolio: params.destiny.portfolio,
      assetClass: params.destiny.asset.class,
      assetName: params.destiny.asset.name,
    }),
    deposit({
      value,
      portfolio: params.liquidityOrigin.portfolio,
      assetClass: params.liquidityOrigin.asset.class,
      assetName: params.liquidityOrigin.asset.name,
    }),
    deposit({
      value: -value,
      portfolio: params.liquidityDestiny.portfolio,
      assetClass: params.liquidityDestiny.asset.class,
      assetName: params.liquidityDestiny.asset.name,
    }),
  ]);

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
  const cryptoAssets = ['binanceBuffer', 'hodl', 'defi', 'defi2'];
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

export default {
  getBalance,
  getShares,
  deposit,
  transfer,
  swap,
  updateAbsoluteTable,
};
