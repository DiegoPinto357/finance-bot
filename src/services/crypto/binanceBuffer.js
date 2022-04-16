import GoogleSheets from '../../providers/GoogleSheets';
import binance from '../../providers/binance';
import config from '../../config';

const targetAsset = 'BRL';
const bridgeAsset = 'USDT';

const googleSheets = new GoogleSheets();

const getSymbolPrice = async symbol =>
  +(await binance.getSymbolPriceTicker({ symbol })).price;

const getTotalPosition = async () => {
  await googleSheets.loadDocument(config.googleSheets.assetsDocId);
  const binanceSpotBuffer = await googleSheets.loadSheet('crypto-spot-buffer');

  const assets = binanceSpotBuffer.map(item => item.asset);

  const assetPrices = await Promise.all(
    assets.map(async asset => {
      if (asset === targetAsset) return 1;

      try {
        const symbol = `${asset}${targetAsset}`;
        return await getSymbolPrice(symbol);
      } catch (e) {
        const bridgePrice = await getSymbolPrice(`${asset}${bridgeAsset}`);
        return (
          (await getSymbolPrice(`${bridgeAsset}${targetAsset}`)) * bridgePrice
        );
      }
    })
  );

  return binanceSpotBuffer.reduce((total, item, index) => {
    const value = item.amount * assetPrices[index];
    return total + value;
  }, 0);
};

export default {
  getTotalPosition,
};
