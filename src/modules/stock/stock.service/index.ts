import { z } from 'zod';
import database from '../../../providers/database';
import brapi from '../../../providers/brapi';
import stockAnalyser from './stockAnalyser';
import { buildLogger } from '../../../libs/logger';
import {
  STOCK_ASSET_TYPE,
  stockAssetSchema,
  positiveCurrencySchema,
} from '../../../schemas';

import type { StockAssetType } from '../../../schemas';

const log = buildLogger('Stock');

type AssetData = {
  asset: string;
  score: number;
  amount: number;
  // TODO use amount instead of value for float type
  value: number;
};

type BalanceWithPrices = AssetData & {
  change: number;
  price: number;
  positionBRL: number;
  positionTarget: number;
};

type BalanceWithPricesFloat = AssetData & {
  positionBRL: number;
};

type AssetTotals = Record<StockAssetType, number>;

type Totals = AssetTotals & {
  total: number;
};

// TODO accept array of portfolio types
const getBalanceWithPrices = async (
  assetType: StockAssetType
): Promise<(BalanceWithPrices | BalanceWithPricesFloat)[]> => {
  const portfolio = await database.find<AssetData[]>(
    'assets',
    'stock',
    { type: assetType },
    { projection: { _id: 0, type: 0 } }
  );

  if (assetType === 'float') {
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
      const { price, change } = await brapi.getQuote(asset);
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

export const getBalanceSchema = z.object({
  assetType: stockAssetSchema,
});

const getBalance = async (
  assetType: z.infer<typeof getAssetPositionSchema>['assetType']
) => {
  const balanceWithPrices = await getBalanceWithPrices(assetType);
  const totalPosition = getTotalFromPortfolio(balanceWithPrices);

  if (assetType === 'float') {
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

export const getAssetPositionSchema = z.object({
  assetType: stockAssetSchema,
});

const getAssetPosition = async (
  assetType: z.infer<typeof getAssetPositionSchema>['assetType']
) => {
  const balanceWithPrices = await getBalanceWithPrices(assetType);
  return getTotalFromPortfolio(balanceWithPrices);
};

const getTotalPosition = async () => {
  const totals = await Promise.all(
    STOCK_ASSET_TYPE.map(async type => {
      // TODO optimize to make a single request
      const balanceWithPrices = await getBalanceWithPrices(type);
      return getTotalFromPortfolio(balanceWithPrices);
    })
  );

  return totals.reduce(
    (obj, current, index) => {
      obj[STOCK_ASSET_TYPE[index]] = current;
      obj.total = obj.total + current;
      return obj;
    },
    <Totals>{ total: 0 }
  );
};

const deposit = async ({
  assetType,
  value,
}: {
  assetType?: StockAssetType;
  value: number;
}) => {
  assetType = assetType ? assetType : 'float';

  if (assetType !== 'float') {
    return { status: 'cannotDepositValue' };
  }

  const currentValue = await getAssetPosition(assetType);
  const newValue = currentValue + value;

  if (newValue < 0) {
    return { status: 'notEnoughFunds' };
  }

  await database.updateOne<AssetData>(
    'assets',
    'stock',
    { type: assetType },
    { $set: { value: newValue } },
    {}
  );

  return { status: 'ok' };
};

export const setAssetValueSchema = z.object({
  assetType: stockAssetSchema.optional(),
  value: positiveCurrencySchema,
});

const setAssetValue = async ({
  assetType,
  value,
}: z.infer<typeof setAssetValueSchema>) => {
  assetType = assetType ? assetType : 'float';

  if (assetType !== 'float') {
    throw new Error(
      `Setting a value for stock of type "${assetType}" is not allowed.`
    );
  }

  await database.updateOne<AssetData>(
    'assets',
    'stock',
    { type: assetType },
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
  getAssetPosition,
  getTotalPosition,
  deposit,
  setAssetValue,
  buy,
  sell,

  analysePortfolio: stockAnalyser.analysePortfolio,
};
