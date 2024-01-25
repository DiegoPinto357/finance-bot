const CoinMarketCap = require('coinmarketcap-api');
const { withCache } = require('../libs/cache');
const { buildLogger } = require('../libs/logger');
const config = require('../config');

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

const fetchSymbolQuoteCached = withCache(fetchSymbolQuote);

const getSymbolPrice = async (symbol, network) => {
  log(`Loading ${symbol} token price`);
  return await fetchSymbolQuoteCached(symbol, network);
};

module.exports = {
  getSymbolPrice,
};
