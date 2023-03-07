import CoinMarketCap from 'coinmarketcap-api';
import { withCache } from '../libs/cache';
import { buildLogger } from '../libs/logger';
import config from '../config';

const client = new CoinMarketCap(process.env.COIMARKETCAP_API_KEY);

const log = buildLogger('CoinMarketCap');

const fetchSymbolQuote = async (symbol, network) => {
  const id = network && config.crypto.tokens[network][symbol].cmcId;
  const query = id ? { id } : { symbol };

  const response = await client.getQuotes({
    ...query,
    convert: 'BRL',
  });
  return response.data[id || symbol].quote.BRL.price;
};

const fetchSymbolQuoteCached = withCache((...params) =>
  fetchSymbolQuote(...params)
);

const getSymbolPrice = async (symbol, network) => {
  log(`Loading ${symbol} token price`);
  return await fetchSymbolQuoteCached(symbol, network);
};

export default {
  getSymbolPrice,
};
