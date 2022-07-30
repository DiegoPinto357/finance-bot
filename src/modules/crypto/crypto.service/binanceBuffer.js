import database from '../../../providers/database';
import binance from '../../../providers/binance';

const targetAsset = 'BRL';
const bridgeAsset = 'USDT';

const getTotalPosition = async () => {
  const binanceSpotBuffer = await database.find(
    'assets',
    'crypto',
    { location: 'binance', type: 'float' },
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
