import _ from 'lodash';
import database from '../../../providers/database';
import binance from '../../../providers/binance';

import type { AssetData } from '../types';

const targetAsset = 'BRL';
const bridgeAsset = 'BUSD';

const getTotalPosition = async (asset?: string) => {
  const baseFilter = { location: 'binance', type: 'float' };
  const filter = asset ? { ...baseFilter, asset } : baseFilter;
  const binanceSpotBuffer = await database.find<AssetData[]>(
    'assets',
    'crypto',
    filter,
    { projection: { _id: 0 } }
  );

  const assets = binanceSpotBuffer.map(item => item.asset);

  const assetPrices = await Promise.all(
    assets.map(async asset =>
      binance.getAssetPrice({ asset, targetAsset, bridgeAsset })
    )
  );

  return binanceSpotBuffer.reduce((total, item, index) => {
    const amount = item.amount ?? 0;
    const value = amount * assetPrices[index];
    return total + value;
  }, 0);
};

const setAssetValue = async ({
  asset,
  value,
}: {
  asset?: string;
  value: number;
}) => {
  asset = asset ? asset : 'BRL';

  if (asset !== 'BRL') {
    return { status: 'cannotSetValue' };
  }

  await database.updateOne<AssetData>(
    'assets',
    'crypto',
    { location: 'binance', type: 'float', asset },
    { $set: { amount: value } },
    {}
  );

  return { status: 'ok' };
};

const deposit = async ({ asset, value }: { asset?: string; value: number }) => {
  asset = asset ? asset : 'BRL';

  if (asset !== 'BRL') {
    return { status: 'cannotDepositValue' };
  }

  const currentValue = await getTotalPosition(asset);
  const newValue = currentValue + value;

  if (newValue < 0) {
    return { status: 'notEnoughFunds' };
  }

  await database.updateOne<AssetData>(
    'assets',
    'crypto',
    { location: 'binance', type: 'float', asset },
    { $set: { amount: newValue } },
    {}
  );

  return { status: 'ok' };
};

export default {
  // TODO add getBalance method
  getBalance: () => {
    throw new Error('Not implemented');
  },
  getTotalPosition,
  setAssetValue,
  deposit,
  sell: (_params: any) => {
    throw new Error('Not implemented');
  },
};
