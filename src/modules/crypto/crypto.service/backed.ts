import database from '../../../providers/database';
import mercadoBitcoin from '../../../providers/mercadoBitcoin';
import { buildLogger } from '../../../libs/logger';

const log = buildLogger('Crypto - Backed');

interface AssetData {
  asset: string;
  amount: number;
}

const getBalance = async () => {
  const assets = await database.find<AssetData[]>(
    'assets',
    'crypto',
    { location: 'mercadoBitcoin', type: 'backed' },
    { projection: { _id: 0 } }
  );

  const balanceTokens = await Promise.all(
    assets.map(async ({ asset, amount }) => {
      const { last } = await mercadoBitcoin.getTicker(asset);
      const priceBRL = parseFloat(last);
      const positionBRL = amount * priceBRL;
      return {
        asset: asset,
        position: amount,
        priceBRL,
        positionBRL,
      };
    })
  );

  const [float] = (
    await database.find<AssetData[]>(
      'assets',
      'crypto',
      { location: 'mercadoBitcoin', type: 'float' },
      { projection: { _id: 0 } }
    )
  ).map(({ asset, amount }) => ({
    asset,
    position: amount,
    priceBRL: 1,
    positionBRL: amount,
  }));

  const balance = [...balanceTokens, float];

  const total = balance.reduce((sum, { positionBRL }) => sum + positionBRL, 0);

  return { balance, total };
};

const getTotalPosition = async (asset?: string) => {
  const { balance, total } = await getBalance();

  if (!asset) {
    return total;
  }

  const assetBalance = balance.find(item => item.asset === asset);
  return assetBalance ? assetBalance.positionBRL : 0;
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
    { asset, location: 'mercadoBitcoin', type: 'float' },
    { $set: { amount: newValue } },
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
    'crypto',
    { location: 'mercadoBitcoin', asset },
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
    return { status: 'notEnoughAssets' };
  }

  await database.updateOne<AssetData>(
    'assets',
    'crypto',
    { location: 'mercadoBitcoin', asset },
    { $inc: { amount: -amount } },
    {}
  );

  await database.updateOne<AssetData>(
    'assets',
    'crypto',
    { location: 'mercadoBitcoin', type: 'float' },
    { $inc: { amount: orderValue } },
    {}
  );

  return { status: 'ok' };
};

export default {
  getBalance,
  getTotalPosition,
  getHistory: () => {
    throw new Error('Not implemented');
  },
  deposit,
  sell,
};
