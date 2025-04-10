import binance from '../../../../providers/binance';
import database from '../../../../providers/database';

import type { AssetData } from '../../types';

const targetAsset = 'BRL';
const bridgeAsset = 'USDT';

type HistoryEntry = {
  date: string;
  value: number;
  deposit: number;
  yieldBRL: number;
  yieldPercentage: number;
};

const mapEarnValue = async (
  asset: string,
  earnPortfolio: { asset: string; amount: number }[]
) => {
  const earnItem = earnPortfolio.find(item => item.asset === asset);
  if (!earnItem) return 0;
  return earnItem.amount;
};

const mapBufferValues = async (
  asset: string,
  spotBufferPortfolio: AssetData[]
) => {
  const item = spotBufferPortfolio.find(item => item.asset === asset);
  if (!item || !item.amount) return { spot: 0 };
  return { spot: item.amount };
};

const mapPortfolioScore = async (asset: string, portfolio: AssetData[]) => {
  const portfolioItem = portfolio.find(item => item.asset === asset);
  return portfolioItem && portfolioItem.score ? portfolioItem.score : 0;
};

const getAssetPrices = async (
  portfolioBalance: { asset: string }[],
  targetAsset: string
) => {
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
  const assets = await database.find<AssetData[]>(
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
    { portfolio: [], binanceSpotBuffer: [] } as {
      portfolio: AssetData[];
      binanceSpotBuffer: AssetData[];
    }
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

    if (isTargetAsset) {
      return { ...item, priceBRL: 1, positionBRL: item.total };
    }

    const existingAsset = assetPrices.find(({ asset }) => asset === item.asset);
    const priceBRL = existingAsset ? existingAsset.price : 0;
    const positionBRL = item.total * priceBRL;

    return { ...item, priceBRL, positionBRL };
  });
};

const getTotalFromPortfolio = (portfolio: { positionBRL: number }[]) =>
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
  deposit: (_value: number) => {
    throw new Error('Not implemented');
  },
  sell: (_params: any) => {
    throw new Error('Not implemented');
  },
};
