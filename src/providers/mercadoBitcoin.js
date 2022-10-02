import httpClient from '../libs/httpClient';
import { withCache } from '../libs/cache';
import { buildLogger } from '../libs/logger';

const host = 'https://www.mercadobitcoin.net';

const getCached = withCache(params => httpClient.get(params));

const log = buildLogger('MercadoBitcoin');

const getTicker = async ticker => {
  log(`Loading ticker ${ticker}`);
  const url = `${host}/api/${ticker}/ticker`;
  const { ticker: data } = await getCached(url);
  return data;
};

export default {
  getTicker,
};
