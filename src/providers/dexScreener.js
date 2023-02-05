import tradingView from './tradingView';
import httpClient from '../libs/httpClient';
import { withCache } from '../libs/cache';
import { buildLogger } from '../libs/logger';
import config from '../config';

const host = 'https://api.dexscreener.com';

const getCached = withCache(params => httpClient.get(params));

const log = buildLogger('DexScreener');

const getSymbolPrice = async (symbol, network) => {
  log(`Loading ${symbol} token price`);
  const { contract } = config.crypto.tokens[network][symbol];
  const url = `${host}/latest/dex/tokens/${contract}`;
  const { pairs } = await getCached(url);

  if (!pairs) return 0;

  const { priceUsd } = pairs
    .sort((a, b) => b.volume.h24 - a.volume.h24)
    .find(({ baseToken }) => baseToken.address === contract) || {
    priceUsd: 0,
  };

  const { lp: usdToBrl } = await tradingView.getTicker('USDBRL');
  return priceUsd * usdToBrl;
};

export default {
  getSymbolPrice,
};
