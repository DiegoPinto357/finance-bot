import database from '../../providers/database';
import tradingView from '../../providers/tradingView';

const types = ['br', 'us', 'fii', 'float'];

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
    types.map(async type => {
      // TODO optimize to make a single request
      const balanceWithPrices = await getBalanceWithPrices(type);
      return getTotalFromPortfolio(balanceWithPrices);
    })
  );

  return totals.reduce(
    (obj, current, index) => {
      obj[types[index]] = current;
      obj.total = obj.total + current;
      return obj;
    },
    { total: 0 }
  );
};

const deposit = async value => {
  const currentValue = await getTotalPosition('float');
  const newValue = currentValue + value;

  if (newValue < 0) {
    return { status: 'notEnoughFunds' };
  }

  await database.updateOne(
    'assets',
    'stock',
    { type: 'float' },
    { $set: { value: newValue } }
  );

  return { status: 'ok' };
};

export default {
  getBalance,
  getTotalPosition,
  deposit,
};
