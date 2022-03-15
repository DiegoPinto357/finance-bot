import tradingView from '../providers/tradingView';
import { loadFile } from '../libs/storage';

const getTotalFromPortfolio = portfolio =>
  portfolio.reduce((total, current) => total + current.positionBRL, 0);

const getBalance = async portfolioType => {
  const filename = `./userData/stock/${portfolioType}-portfolio.json`;
  const portfolio = await loadFile(filename);

  const totalScore = portfolio.reduce((total, { score }) => total + score, 0);

  const balanceWithPrices = await Promise.all(
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

  const totalPosition = getTotalFromPortfolio(balanceWithPrices);

  return balanceWithPrices
    .map(item => {
      const { positionBRL, positionTarget, price } = item;
      const position = positionBRL / totalPosition;

      const positionDiff = position - positionTarget;
      const diffBRL = positionTarget * totalPosition - positionBRL;
      const diffAmount = diffBRL / price;

      return { ...item, position, positionDiff, diffBRL, diffAmount };
    })
    .sort((a, b) => b.diffBRL - a.diffBRL);
};

export default {
  getBalance,
};
