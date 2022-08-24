import _ from 'lodash';
import database from '../../../providers/database';
import binance from '../../../providers/binance';

const targetAsset = 'BRL';
const bridgeAsset = 'BUSD';

const getTotalPosition = async asset => {
  const binanceSpotBuffer = await database.find(
    'assets',
    'crypto',
    _.omitBy({ location: 'binance', type: 'float', ...{ asset } }, _.isNil),
    { projection: { _id: 0 } }
  );

  const assets = binanceSpotBuffer.map(item => item.asset);

  const assetPrices = await Promise.all(
    assets.map(async asset =>
      binance.getAssetPriceWithBridge({ asset, targetAsset, bridgeAsset })
    )
  );

  return binanceSpotBuffer.reduce((total, item, index) => {
    const value = item.amount * assetPrices[index];
    return total + value;
  }, 0);
};

const setAssetValue = async ({ asset, value }) => {
  asset = asset ? asset : 'BRL';

  if (asset !== 'BRL') {
    return { status: 'cannotSetValue' };
  }

  await database.updateOne(
    'assets',
    'crypto',
    { location: 'binance', type: 'float', asset },
    { $set: { amount: value } }
  );

  return { status: 'ok' };
};

const deposit = async ({ asset, value }) => {
  asset = asset ? asset : 'BRL';

  if (asset !== 'BRL') {
    return { status: 'cannotDepositValue' };
  }

  const currentValue = await getTotalPosition(asset);
  const newValue = currentValue + value;

  if (newValue < 0) {
    return { status: 'notEnoughFunds' };
  }

  await database.updateOne(
    'assets',
    'crypto',
    { location: 'binance', type: 'float', asset },
    { $set: { amount: newValue } }
  );

  return { status: 'ok' };
};

export default {
  getTotalPosition,
  setAssetValue,
  deposit,
};
