import { MainClient } from 'binance';
import { buildLogger } from '../libs/logger';

const log = buildLogger('Binance');

const client = new MainClient({
  api_key: process.env.BINANCE_API_KEY,
  api_secret: process.env.BINANCE_API_SECRET,
});

const getAccountInformation = async () => {
  log('Loading account information');
  return client.getAccountInformation();
};

const getSymbolPriceTicker = async ({ symbol }) => {
  log(`Loading price ticker for ${symbol}`);
  return client.getSymbolPriceTicker({ symbol });
};

const get24hrChangeStatististics = async ({ symbol }) => {
  log(`Loading 24h change statistics for ${symbol}`);
  return client.get24hrChangeStatististics({ symbol });
};

const getSymbolPrice = async symbol =>
  +(await getSymbolPriceTicker({ symbol })).price;

const getAssetPriceWithBridge = async ({ asset, targetAsset, bridgeAsset }) => {
  if (asset === targetAsset) return 1;

  const symbol = `${asset}${targetAsset}`;

  try {
    return await getSymbolPrice(symbol);
  } catch (e) {
    log(
      `Symbol ${symbol} not available. Using ${bridgeAsset} token as bridge.`
    );
    const bridgePrice = await getSymbolPrice(`${asset}${bridgeAsset}`);
    return (await getSymbolPrice(`${bridgeAsset}${targetAsset}`)) * bridgePrice;
  }
};

export default {
  getAccountInformation,
  getSymbolPriceTicker,
  get24hrChangeStatististics,
  getAssetPriceWithBridge,
};
