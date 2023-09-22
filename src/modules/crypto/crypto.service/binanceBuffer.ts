import _ from 'lodash';
import database from '../../../providers/database';
import binance from '../../../providers/binance';

const targetAsset = 'BRL';
const bridgeAsset = 'BUSD';

interface AssetData {
  asset: string;
  location: string;
  type: string;
  amount: number;
}

const getTotalPosition = async (asset?: string) => {
  const binanceSpotBuffer = await database.find<AssetData[]>(
    'assets',
    'crypto',
    _.omitBy(
      <AssetData>{ location: 'binance', type: 'float', ...{ asset } },
      _.isNil
    ),
    { projection: { _id: 0 } }
  );

  const assets = binanceSpotBuffer.map(item => item.asset);

  const assetPrices = await Promise.all(
    assets.map(async asset =>
      binance.getAssetPrice({ asset, targetAsset, bridgeAsset })
    )
  );

  return binanceSpotBuffer.reduce((total, item, index) => {
    const value = item.amount * assetPrices[index];
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
  getHistory: () => {
    throw new Error('Not implemented');
  },
  getTotalPosition,
  setAssetValue,
  deposit,
  sell: (_params: any) => {
    throw new Error('Not implemented');
  },
};
