import { promises as fs } from 'fs';
import { MainClient } from 'binance';

const exchangeClient = new MainClient({
  api_key: process.env.BINANCE_API_KEY,
  api_secret: process.env.BINANCE_API_SECRET,
});

const mapEarnValue = async asset => {
  // TODO create load file lib
  const binanceEarn = JSON.parse(
    await fs.readFile('./userData/crypto/binance-earn.json', 'utf-8')
  );

  const earnItem = Object.entries(binanceEarn).find(([key]) => key === asset);

  if (!earnItem) return 0;

  const { amount } = earnItem[1];
  return Array.isArray(amount)
    ? amount.reduce((acc, current) => (acc += current), 0)
    : amount;
};

const mapPortfolioScore = async asset => {
  // TODO create load file lib
  const portfolio = JSON.parse(
    await fs.readFile('./userData/crypto/portfolio.json', 'utf-8')
  );

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
      return await exchangeClient.getSymbolPriceTicker({ symbol });
    })
  );

  const targetBasePrice = await exchangeClient.getSymbolPriceTicker({
    symbol: `${baseAsset}${targetAsset}`,
  });

  return symbolPrices.map(({ symbol, price }) => ({
    asset: symbol.replace(baseAsset, ''),
    price: price * targetBasePrice.price,
  }));
};

const getBalance = async () => {
  const { balances: binanceBalance } =
    await exchangeClient.getAccountInformation();
  const binanceSpot = binanceBalance.filter(
    item => parseFloat(item.free) !== 0
  );

  const balance = await Promise.all(
    binanceSpot.map(async item => {
      const earn = await mapEarnValue(item.asset);
      const portfolioScore = await mapPortfolioScore(item.asset);

      const spot = parseFloat(item.free);
      return {
        asset: item.asset,
        spot,
        earn,
        total: spot + earn,
        portfolioScore,
      };
    })
  );

  const targetAsset = 'BRL';

  const portfolioBalance = balance.filter(
    item => item.portfolioScore !== 0 || item.asset === targetAsset
  );

  const assetPrices = await getAssetPrices(portfolioBalance, targetAsset);

  let totalPosition = 0;

  const balanceWithPrices = portfolioBalance.map(item => {
    const isTargetAsset = item.asset === targetAsset;

    const priceBRL = isTargetAsset
      ? 1
      : assetPrices.find(({ asset }) => asset === item.asset).price;

    const positionBRL = item.total * priceBRL;

    totalPosition += positionBRL;

    return { ...item, priceBRL, positionBRL };
  });

  const totalScore = balanceWithPrices.reduce(
    (total, current) => total + current.portfolioScore,
    0
  );

  return balanceWithPrices
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
};

export default {
  getBalance,
};
