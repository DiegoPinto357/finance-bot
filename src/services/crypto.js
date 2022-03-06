import { promises as fs } from 'fs';
import { MainClient } from 'binance';

const exchangeClient = new MainClient({
  api_key: process.env.BINANCE_API_KEY,
  api_secret: process.env.BINANCE_API_SECRET,
});

const mapEarnValue = (asset, binanceEarn) => {
  const earnItem = Object.entries(binanceEarn).find(([key]) => key === asset);

  if (!earnItem) return 0;

  const { amount } = earnItem[1];
  return Array.isArray(amount)
    ? amount.reduce((acc, current) => (acc += current), 0)
    : amount;
};

const mapPortfolioScore = (asset, portfolio) => {
  const portfolioItem = Object.entries(portfolio).find(
    ([key]) => key === asset
  );
  return portfolioItem ? portfolioItem[1].score : 0;
};

const getBalance = async () => {
  const { balances } = await exchangeClient.getAccountInformation();
  const binanceSpot = balances.filter(item => parseFloat(item.free) !== 0);

  // TODO create load file lib
  const binanceEarn = JSON.parse(
    await fs.readFile('./userData/crypto/binance-earn.json', 'utf-8')
  );
  const portfolio = JSON.parse(
    await fs.readFile('./userData/crypto/portfolio.json', 'utf-8')
  );

  const balance = binanceSpot.map(item => {
    const earn = mapEarnValue(item.asset, binanceEarn);
    const portfolioScore = mapPortfolioScore(item.asset, portfolio);

    const spot = parseFloat(item.free);
    return {
      asset: item.asset,
      spot,
      earn,
      total: spot + earn,
      portfolioScore,
    };
  });

  return balance.filter(
    item => item.portfolioScore !== 0 || item.asset === 'BRL'
  );
};

export default {
  getBalance,
};
