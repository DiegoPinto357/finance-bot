import { Spot } from '@binance/connector';
import { withCache } from '../libs/cache';
import { buildLogger } from '../libs/logger';

const log = buildLogger('Binance');

const client = new Spot(
  process.env.BINANCE_API_KEY,
  process.env.BINANCE_API_SECRET
);

const getAccountInformationCached = withCache(
  params => client.account(params),
  { dataNode: 'data' }
);
const getTickerPriceCached = withCache(params => client.tickerPrice(params), {
  dataNode: 'data',
});

const getAccountInformation = async () => {
  log('Loading account information');
  const { data } = await getAccountInformationCached();
  return data;
};

const getSymbolPriceTicker = async ({ symbol }) => {
  log(`Loading price ticker for ${symbol}`);
  const { data } = await getTickerPriceCached(symbol);
  return data;
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
  getAssetPriceWithBridge,
};
