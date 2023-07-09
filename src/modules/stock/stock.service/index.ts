import database from '../../../providers/database';
import tradingView from '../../../providers/tradingView';
import stockAnalyser from './stockAnalyser';
import { buildLogger } from '../../../libs/logger';

const log = buildLogger('Stock');

export const portfolioTypes = ['br', 'us', 'fii', 'float'] as const;

type PortfolioTypes = (typeof portfolioTypes)[number];

interface AssetData {
  asset: string;
  score: number;
  amount: number;
  // TODO use amount instead of value for float type
  value: number;
}

interface BalanceWithPrices extends AssetData {
  change: number;
  price: number;
  positionBRL: number;
  positionTarget: number;
}

interface BalanceWithPricesFloat extends AssetData {
  positionBRL: number;
}

const getBalanceWithPrices = async (
  portfolioType: PortfolioTypes
): Promise<(BalanceWithPrices | BalanceWithPricesFloat)[]> => {
  const portfolio = await database.find<AssetData[]>(
    'assets',
    'stock',
    { type: portfolioType },
    { projection: { _id: 0, type: 0 } }
  );

  if (portfolioType === 'float') {
    return <BalanceWithPricesFloat[]>(
      portfolio.map(({ asset, value }) => ({ asset, positionBRL: value }))
    );
  }

  const totalScore = portfolio.reduce(
    (total, { score }) => total + (score || 0),
    0
  );

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

const getTotalFromPortfolio = (
  portfolios: (BalanceWithPrices | BalanceWithPricesFloat)[]
) =>
  portfolios.reduce(
    (total: number, current: BalanceWithPrices | BalanceWithPricesFloat) =>
      total + current.positionBRL,
    0
  );

const getBalance = async (portfolioType: PortfolioTypes) => {
  const balanceWithPrices = await getBalanceWithPrices(portfolioType);
  const totalPosition = getTotalFromPortfolio(balanceWithPrices);

  if (portfolioType === 'float') {
    return { total: totalPosition };
  }

  const balance = balanceWithPrices
    .map(item => {
      const { positionBRL, positionTarget, price } = <BalanceWithPrices>item;
      const position = positionBRL / totalPosition;

      const positionDiff = position - positionTarget;
      const diffBRL = positionTarget * totalPosition - positionBRL;
      const diffAmount = diffBRL / price;

      return { ...item, position, positionDiff, diffBRL, diffAmount };
    })
    .sort((a, b) => b.diffBRL - a.diffBRL);

  return { balance, total: totalPosition };
};

const getTotalPosition = async (portfolioType?: PortfolioTypes) => {
  if (portfolioType) {
    const balanceWithPrices = await getBalanceWithPrices(portfolioType);
    return getTotalFromPortfolio(balanceWithPrices);
  }

  const totals = await Promise.all(
    portfolioTypes.map(async type => {
      // TODO optimize to make a single request
      const balanceWithPrices = await getBalanceWithPrices(type);
      return getTotalFromPortfolio(balanceWithPrices);
    })
  );

  interface Totals {
    [key: string]: number;
    total: number;
  }

  return totals.reduce(
    (obj, current, index) => {
      obj[portfolioTypes[index]] = current;
      obj.total = obj.total + current;
      return obj;
    },
    <Totals>{ total: 0 }
  );
};

const deposit = async ({ asset, value }: { asset: string; value: number }) => {
  asset = asset ? asset : 'float';

  if (asset !== 'float') {
    return { status: 'cannotDepositValue' };
  }

  const currentValue = await (<Promise<number>>getTotalPosition(asset));
  const newValue = currentValue + value;

  if (newValue < 0) {
    return { status: 'notEnoughFunds' };
  }

  await database.updateOne<AssetData>(
    'assets',
    'stock',
    { type: asset },
    { $set: { value: newValue } },
    {}
  );

  return { status: 'ok' };
};

const setAssetValue = async ({
  asset,
  value,
}: {
  asset: string;
  value: number;
}) => {
  asset = asset ? asset : 'float';

  if (asset !== 'float') {
    return { status: 'cannotSetValue' };
  }

  await database.updateOne<AssetData>(
    'assets',
    'stock',
    { type: asset },
    { $set: { value } },
    {}
  );

  return { status: 'ok' };
};

const buy = async ({
  asset,
  amount,
  orderValue,
}: {
  asset: string;
  amount: number;
  orderValue: number;
}) => {
  const updateResult = await database.updateOne<AssetData>(
    'assets',
    'stock',
    { asset },
    { $inc: { amount } },
    {}
  );

  if (!updateResult || updateResult.matchedCount === 0) {
    log(`Asset ${asset} not found while trying to register a buy action`, {
      severity: 'warn',
    });
    return { status: 'assetNotFound' };
  }

  await database.updateOne<AssetData>(
    'assets',
    'stock',
    { type: 'float' },
    { $inc: { value: -orderValue } },
    {}
  );

  return { status: 'ok' };
};

const sell = async ({
  asset,
  amount,
  orderValue,
}: {
  asset: string;
  amount: number;
  orderValue: number;
}) => {
  const currentAssetData = await database.findOne<AssetData>(
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

  await database.updateOne<AssetData>(
    'assets',
    'stock',
    { asset },
    { $inc: { amount: -amount } },
    {}
  );

  await database.updateOne<AssetData>(
    'assets',
    'stock',
    { type: 'float' },
    { $inc: { value: orderValue } },
    {}
  );

  return { status: 'ok' };
};

export default {
  getBalance,
  getTotalPosition,
  deposit,
  setAssetValue,
  buy,
  sell,

  analysePortfolio: stockAnalyser.analysePortfolio,
};
