import GoogleSheets from '../../providers/GoogleSheets';
import binance from '../../providers/binance';
import config from '../../config';

const targetAsset = 'BRL';
const bridgeAsset = 'USDT';

const googleSheets = new GoogleSheets();

const getTotalPosition = async () => {
  await googleSheets.loadDocument(config.googleSheets.assetsDocId);
  const binanceSpotBuffer = await googleSheets.loadSheet('crypto-spot-buffer');

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
