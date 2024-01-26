// @ts-ignore
import CoinMarketCap from 'coinmarketcap-api';
import { withCache } from '../libs/cache';
import { buildLogger } from '../libs/logger';
import config from '../config';

import type { CryptoNetwork } from '../modules/crypto/types';

const client = new CoinMarketCap(process.env.COIMARKETCAP_API_KEY);

const log = buildLogger('CoinMarketCap');

const fetchSymbolQuote = async (symbol: string, network: CryptoNetwork) => {
  const id = network && config.crypto.tokens[network][symbol].cmcId;
  const query = id ? { id } : { symbol };

  const response = await client.getQuotes({
    ...query,
    convert: 'BRL',
  });
  return response.data[id || symbol].quote.BRL.price as number;
};

const fetchSymbolQuoteCached = withCache(fetchSymbolQuote);

const getSymbolPrice = async (symbol: string, network: CryptoNetwork) => {
  log(`Loading ${symbol} token price`);
  return await fetchSymbolQuoteCached(symbol, network);
};

export default {
  getSymbolPrice,
};
