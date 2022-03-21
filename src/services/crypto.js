import { MainClient } from 'binance';
import { loadFile } from '../libs/storage';

const portfolio = await loadFile('./userData/crypto/portfolio.json');

const targetAsset = 'BRL';

const exchangeClient = new MainClient({
  api_key: process.env.BINANCE_API_KEY,
  api_secret: process.env.BINANCE_API_SECRET,
});

const mapEarnValue = async asset => {
  const binanceEarn = await loadFile('./userData/crypto/binance-earn.json');

  const earnItem = Object.entries(binanceEarn).find(([key]) => key === asset);

  if (!earnItem) return 0;

  const { amount } = earnItem[1];
  return Array.isArray(amount)
    ? amount.reduce((acc, current) => (acc += current), 0)
    : amount;
};

const mapPortfolioScore = async asset => {
  const portfolioItem = Object.entries(portfolio).find(
    ([key]) => key === asset
  );
  return portfolioItem ? portfolioItem[1].score : 0;
};

const getAssetPrices = async (portfolioBalance, targetAsset) => {
  const baseAsset = 'USDT';
  const symbols = portfolioBalance
    .map(({ asset }) => `${asset}${baseAsset}`)
    .filter(symbol => !['BRLUSDT'].includes(symbol));

  const symbolPrices = await Promise.all(
    symbols.map(async symbol => {
      return await exchangeClient.get24hrChangeStatististics({ symbol });
    })
  );

  const targetBasePrice = await exchangeClient.getSymbolPriceTicker({
    symbol: `${baseAsset}${targetAsset}`,
  });

  return symbolPrices.map(({ symbol, lastPrice }) => ({
    asset: symbol.replace(baseAsset, ''),
    price: lastPrice * targetBasePrice.price,
  }));
};

const getPortfolioWithPrices = async () => {
  const { balances: binanceBalance } =
    await exchangeClient.getAccountInformation();
  const binanceSpot = binanceBalance.filter(item =>
    Object.keys(portfolio).includes(item.asset)
  );

  const balance = await Promise.all(
    binanceSpot.map(async item => {
      const earn = await mapEarnValue(item.asset);
      const portfolioScore = await mapPortfolioScore(item.asset);

      const spot = parseFloat(item.free) + parseFloat(item.locked);
      return {
        asset: item.asset,
        spot,
        earn,
        total: spot + earn,
        portfolioScore,
      };
    })
  );

  const portfolioBalance = balance.filter(
    item => item.portfolioScore !== 0 || item.asset === targetAsset
  );

  const assetPrices = await getAssetPrices(portfolioBalance, targetAsset);

  return portfolioBalance.map(item => {
    const isTargetAsset = item.asset === targetAsset;

    const { price: priceBRL } = isTargetAsset
      ? { price: 1 }
      : assetPrices.find(({ asset }) => asset === item.asset);

    const positionBRL = item.total * priceBRL;

    return { ...item, priceBRL, positionBRL };
  });
};

const getTotalFromPortfolio = portfolio =>
  portfolio.reduce((total, current) => total + current.positionBRL, 0);

const getBalance = async () => {
  const portfolioWithPrices = await getPortfolioWithPrices();

  const totalPosition = getTotalFromPortfolio(portfolioWithPrices);

  const totalScore = portfolioWithPrices.reduce(
    (total, current) => total + current.portfolioScore,
    0
  );

  const balance = portfolioWithPrices
    .map(item => {
      const positionTarget = item.portfolioScore / totalScore;
      const position = item.positionBRL / totalPosition;
      const positionDiff = position - positionTarget;
      const diffBRL = positionTarget * totalPosition - item.positionBRL;
      const diffTokens = diffBRL / item.priceBRL;

      return {
        ...item,
        positionTarget,
        position,
        positionDiff,
        diffBRL,
        diffTokens,
      };
    })
    .sort((a, b) => b.diffBRL - a.diffBRL);

  return { balance, total: totalPosition };
};

const getTotalPosition = async () => {
  const portfolioWithPrices = await getPortfolioWithPrices();
  return getTotalFromPortfolio(portfolioWithPrices);
};

export default {
  getBalance,
  getTotalPosition,
};
