import binance from '../../../providers/binance';
import database from '../../../providers/database';
import googleSheets from '../../../providers/googleSheets';

const targetAsset = 'BRL';
const bridgeAsset = 'USDT';

const mapEarnValue = async (asset, earnPortfolio) => {
  const earnItem = earnPortfolio.find(item => item.asset === asset);
  if (!earnItem) return 0;
  return earnItem.amount;
};

const mapBufferValues = async (asset, spotBufferPortfolio) => {
  const item = spotBufferPortfolio.find(item => item.asset === asset);
  if (!item) return { spot: 0 };
  return { spot: item.amount };
};

const mapPortfolioScore = async (asset, portfolio) => {
  const portfolioItem = portfolio.find(item => item.asset === asset);
  return portfolioItem ? portfolioItem.score : 0;
};

const getAssetPrices = async (portfolioBalance, targetAsset) => {
  const assets = portfolioBalance.map(({ asset }) => asset);

  const prices = await Promise.all(
    assets.map(async asset => {
      return await binance.getAssetPrice({
        asset,
        targetAsset,
        bridgeAsset,
      });
    })
  );

  return assets.map((asset, index) => ({
    asset,
    price: prices[index],
  }));
};

const getAssetData = async () => {
  const assets = await database.find(
    'assets',
    'crypto',
    { location: 'binance' },
    { projection: { _id: 0 } }
  );

  return assets.reduce(
    (result, asset) => {
      if (asset.type === 'spot') result.portfolio.push(asset);
      if (asset.type === 'float') result.binanceSpotBuffer.push(asset);

      return result;
    },
    { portfolio: [], binanceSpotBuffer: [] }
  );
};

const getPortfolioWithPrices = async () => {
  const { portfolio, binanceSpotBuffer } = await getAssetData();

  const { balances: binanceBalance } = await binance.getAccountInformation();
  const binanceSpot = binanceBalance.filter(item =>
    portfolio.map(({ asset }) => asset).includes(item.asset)
  );

  const earnBalance = await binance.getEarnPosition();

  const balance = await Promise.all(
    binanceSpot.map(async ({ asset, free, locked }) => {
      const earn = await mapEarnValue(asset, earnBalance);
      const { spot: spotBufferValue } = await mapBufferValues(
        asset,
        binanceSpotBuffer
      );
      const portfolioScore = await mapPortfolioScore(asset, portfolio);

      const spot = parseFloat(free) + parseFloat(locked) - spotBufferValue;
      return {
        asset,
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

const getHistory = async () => {
  const historyData = await googleSheets.loadSheet('crypto-hodl-history');
  const currentTotal = await getTotalPosition();

  const current = historyData[historyData.length - 1];
  const date = new Date();
  current.date = date.toLocaleDateString('pt-BR');
  current.value = currentTotal;

  return historyData.map((item, index, array) => {
    let lastValue = 0;

    if (index > 0) lastValue = array[index - 1].value;

    item.yieldBRL = item.value - lastValue - item.deposit;

    if (index > 0) item.yieldPercentage = item.yieldBRL / lastValue;

    return item;
  });
};

export default {
  getBalance,
  getTotalPosition,
  getHistory,
  deposit: _value => {
    throw new Error('Not implemented');
  },
};
