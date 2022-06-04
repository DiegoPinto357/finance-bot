import 'dotenv/config';
import CoinMarketCap from 'coinmarketcap-api';
import { withCache } from '../libs/cache';
import { buildLogger } from '../libs/logger';
import config from '../config';

const client = new CoinMarketCap(process.env.COIMARKETCAP_API_KEY);

const log = buildLogger('CoinMarketCap');

const getQuotesCached = withCache(params => client.getQuotes(params), {
  dataNode: 'data',
});

const getSymbolPrice = async (symbol, network) => {
  const id = network && config.crypto.tokens[network]?.[symbol]?.cmcId;
  const query = id ? { id } : { symbol };

  log(`Loading ${symbol} token price`);
  const response = await getQuotesCached({
    ...query,
    convert: 'BRL',
  });
  return response.data[id || symbol].quote.BRL.price;
};

export default {
  getSymbolPrice,
};
