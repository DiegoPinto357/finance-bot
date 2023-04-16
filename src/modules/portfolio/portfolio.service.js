const { buildLogger } = require('../../libs/logger');
const googleSheets = require('../../providers/googleSheets');
const database = require('../../providers/database');
const fixedService = require('../fixed/fixed.service');
const stockService = require('../stock/stock.service');
const cryptoService = require('../crypto/crypto.service');

const log = buildLogger('Portfolios');

const services = {
  fixed: fixedService,
  stock: stockService,
  crypto: cryptoService,
};

const precision = 0.006;
const isAround0 = value => value >= 0 - precision && value <= 0 + precision;
const isAround1 = value => value >= 1 - precision && value <= 1 + precision;
const isNegative = value => value < -precision;

const verifyShares = shares => {
  const sum = shares.reduce((acc, current) => acc + current, 0);

  if (!isAround1(sum) && !isAround0(sum))
    throw new Error(`Sum of shares is not 1: current value ${sum}`);
};

const getPortfolioData = (filter = {}) =>
  database.find('portfolio', 'shares', filter, { projection: { _id: 0 } });

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
      // TODO provide assets to getters to prevent getting data from all assets
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

const findShare = (shares, assetClass, asset) => {
  let share = shares.find(
    share => asset === share.asset && assetClass === share.assetClass
  );

  if (!share) {
    share = shares.find(
      share => assetClass === share.assetClass && share.asset === ''
    );

    if (!share) {
      return { status: 'notFound' };
    }

    return { share, status: 'hasNoAssetName' };
  }

  return { share, status: 'hasAssetName' };
};

const flatPortfolioBalance = balance => [
  ...balance.fixed.balance.map(item => ({ assetClass: 'fixed', ...item })),
  ...balance.stock.balance.map(item => ({ assetClass: 'stock', ...item })),
  ...balance.crypto.balance.map(item => ({
    assetClass: 'crypto',
    ...item,
  })),
];

const mapTargetShares = (portfolioShares, balanceFlat) =>
  balanceFlat.reduce((shares, { assetClass, asset, value }) => {
    const { share, status } = findShare(portfolioShares, assetClass, asset);

    const shareItem = { assetClass, value };

    if (status === 'notFound') {
      shares.push({
        ...shareItem,
        asset,
        targetShare: 0,
      });

      return shares;
    }

    if (status === 'hasNoAssetName') {
      const shareClassItem = shares.find(
        ({ assetClass }) => assetClass === assetClass
      );

      if (!shareClassItem) {
        shares.push({
          ...shareItem,
          targetShare: share ? share.targetShare : 0,
        });
      } else {
        shareClassItem.value = shareClassItem.value + value;
      }

      return shares;
    }

    shares.push({
      ...shareItem,
      asset,
      targetShare: share.targetShare,
    });

    return shares;
  }, []);

const mapActualShares = (targetShares, total) => {
  const totalTargetShare = targetShares.reduce(
    (total, { targetShare }) => total + targetShare,
    0
  );

  const isTargetSharesAvailable = isAround1(totalTargetShare);

  return targetShares
    .map(share => {
      const currentShare = share.value / total;
      const diffBRL = isTargetSharesAvailable
        ? share.targetShare * total - share.value
        : 0;

      return { ...share, currentShare, diffBRL };
    })
    .sort((a, b) =>
      isTargetSharesAvailable ? b.diffBRL - a.diffBRL : a.value - b.value
    );
};

const getShares = async portfolioName => {
  if (portfolioName) {
    const sharesSheetTitle = `portfolio-${portfolioName}-shares`;
    const [{ balance, total }, portfolioShares] = await Promise.all([
      getBalance(portfolioName),
      googleSheets.loadSheet(sharesSheetTitle),
    ]);

    const balanceFlat = flatPortfolioBalance(balance);
    const targetShares = mapTargetShares(portfolioShares, balanceFlat);
    const shares = mapActualShares(targetShares, total);

    return { shares, total };
  }

  const totalBalance = await getBalance();
  const totalBalanceFlat = Object.entries(totalBalance.balance).map(
    ([key, value]) => ({
      portfolio: key,
      balance: flatPortfolioBalance(value.balance),
    })
  );

  const portfolios = await getPortfolios();
  const shares = await Promise.all(
    portfolios.map(async portfolio => {
      const sharesSheetTitle = `portfolio-${portfolio}-shares`;
      const portfolioShares = await googleSheets.loadSheet(sharesSheetTitle);

      const balanceFlatItem = totalBalanceFlat.find(
        item => item.portfolio === portfolio
      );
      const balanceFlat = balanceFlatItem ? balanceFlatItem.balance : [];

      const total = totalBalance.balance[portfolio]
        ? totalBalance.balance[portfolio].total
        : 0;

      const targetShares = mapTargetShares(portfolioShares, balanceFlat);
      const shares = mapActualShares(targetShares, total);

      return { portfolio, shares };
    })
  );

  return { shares, total: totalBalance.total };
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

const getPortfolios = async () => {
  const portfolioData = await getPortfolioData();
  const portfolios = new Set();

  portfolioData.forEach(asset =>
    asset.shares.forEach(({ portfolio }) => portfolios.add(portfolio))
  );

  return Array.from(portfolios);
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

module.exports = {
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
