const httpClient = require('../libs/httpClient');
const { withCache } = require('../libs/cache');
const { buildLogger } = require('../libs/logger');

const host = 'https://www.mercadobitcoin.net';

const getCached = withCache(params => httpClient.get(params));

const log = buildLogger('MercadoBitcoin');

const getTicker = async ticker => {
  log(`Loading ticker ${ticker}`);
  const url = `${host}/api/${ticker}/ticker`;
  const { ticker: data } = await getCached(url);
  return data;
};

module.exports = {
  getTicker,
};
