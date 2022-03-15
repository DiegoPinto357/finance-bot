import tradingView from '../providers/tradingView';
import { loadFile } from '../libs/storage';

const getTotalFromPortfolio = portfolio =>
  portfolio.reduce((total, current) => total + current.positionBRL, 0);

const getBalance = async () => {
  const portfolio = await loadFile('./userData/stock/br-portfolio.json');

  const totalScore = portfolio.reduce((total, { score }) => total + score, 0);

  const balanceWithPrices = await Promise.all(
    portfolio.map(async item => {
      const { asset, amount, score } = item;
      const price = await tradingView.getTickerValue(asset);
      const positionBRL = amount * price;
      const positionTarget = score / totalScore;

      return { ...item, price, positionBRL, positionTarget };
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
