const database = require('../../../providers/database');
const tradingView = require('../../../providers/tradingView');
const stockAnalyser = require('./stockAnalyser');
const { buildLogger } = require('../../../libs/logger');

const log = buildLogger('Stock');

const PortfolioTypes = ['br', 'us', 'fii', 'float'];

const getBalanceWithPrices = async portfolioType => {
  const portfolio = await database.find(
    'assets',
    'stock',
    { type: portfolioType },
    { projection: { _id: 0, type: 0 } }
  );

  if (portfolioType === 'float') {
    return portfolio.map(({ value }) => ({ positionBRL: value }));
  }

  const totalScore = portfolio.reduce((total, { score }) => total + score, 0);

  return await Promise.all(
    portfolio.map(async item => {
      const { asset, amount, score } = item;
      const { lp: price, chp: change } = await tradingView.getTicker(asset);
      const positionBRL = amount * price;
      const positionTarget = score / totalScore;

      return {
        ...item,
        change: change / 100,
        price,
        positionBRL,
        positionTarget,
      };
    })
  );
};

const getTotalFromPortfolio = portfolio =>
  portfolio.reduce((total, current) => total + current.positionBRL, 0);

const getBalance = async portfolioType => {
  const balanceWithPrices = await getBalanceWithPrices(portfolioType);
  const totalPosition = getTotalFromPortfolio(balanceWithPrices);

  const balance = balanceWithPrices
    .map(item => {
      const { positionBRL, positionTarget, price } = item;
      const position = positionBRL / totalPosition;

      const positionDiff = position - positionTarget;
      const diffBRL = positionTarget * totalPosition - positionBRL;
      const diffAmount = diffBRL / price;

      return { ...item, position, positionDiff, diffBRL, diffAmount };
    })
    .sort((a, b) => b.diffBRL - a.diffBRL);

  return { balance, total: totalPosition };
};

const getTotalPosition = async portfolioType => {
  if (portfolioType) {
    const balanceWithPrices = await getBalanceWithPrices(portfolioType);
    return getTotalFromPortfolio(balanceWithPrices);
  }

  const totals = await Promise.all(
    PortfolioTypes.map(async type => {
      // TODO optimize to make a single request
      const balanceWithPrices = await getBalanceWithPrices(type);
      return getTotalFromPortfolio(balanceWithPrices);
    })
  );

  return totals.reduce(
    (obj, current, index) => {
      obj[PortfolioTypes[index]] = current;
      obj.total = obj.total + current;
      return obj;
    },
    { total: 0 }
  );
};

const deposit = async ({ asset, value }) => {
  asset = asset ? asset : 'float';

  if (asset !== 'float') {
    return { status: 'cannotDepositValue' };
  }

  const currentValue = await getTotalPosition(asset);
  const newValue = currentValue + value;

  if (newValue < 0) {
    return { status: 'notEnoughFunds' };
  }

  await database.updateOne(
    'assets',
    'stock',
    { type: asset },
    { $set: { value: newValue } }
  );

  return { status: 'ok' };
};

const setAssetValue = async ({ asset, value }) => {
  asset = asset ? asset : 'float';

  if (asset !== 'float') {
    return { status: 'cannotSetValue' };
  }

  await database.updateOne(
    'assets',
    'stock',
    { type: asset },
    { $set: { value } }
  );

  return { status: 'ok' };
};

const buy = async ({ asset, amount, orderValue }) => {
  const { matchedCount } = await database.updateOne(
    'assets',
    'stock',
    { asset },
    { $inc: { amount } }
  );

  if (matchedCount === 0) {
    log(`Asset ${asset} not found while trying to register a buy action`, {
      severity: 'warn',
    });
    return { status: 'assetNotFound' };
  }

  await database.updateOne(
    'assets',
    'stock',
    { type: 'float' },
    { $inc: { value: -orderValue } }
  );

  return { status: 'ok' };
};

const sell = async ({ asset, amount, orderValue }) => {
  const currentAssetData = await database.findOne(
    'assets',
    'stock',
    { asset },
    { projection: { _id: 0, type: 0 } }
  );

  if (!currentAssetData) {
    log(`Asset ${asset} not found while trying to register a sell action`, {
      severity: 'warn',
    });
    return { status: 'assetNotFound' };
  }

  if (amount > currentAssetData.amount) {
    log(`Not enought stocks to sell ${asset}`, {
      severity: 'warn',
    });
    return { status: 'notEnoughStocks' };
  }

  await database.updateOne(
    'assets',
    'stock',
    { asset },
    { $inc: { amount: -amount } }
  );

  await database.updateOne(
    'assets',
    'stock',
    { type: 'float' },
    { $inc: { value: orderValue } }
  );

  return { status: 'ok' };
};

module.exports = {
  PortfolioTypes,

  getBalance,
  getTotalPosition,
  deposit,
  setAssetValue,
  buy,
  sell,

  analysePortfolio: stockAnalyser.analysePortfolio,
};
