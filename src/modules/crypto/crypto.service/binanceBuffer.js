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

export default {
  getTotalPosition,
};
