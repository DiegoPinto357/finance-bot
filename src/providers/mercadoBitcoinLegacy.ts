import httpClient from '../libs/httpClient';
import { withCache } from '../libs/cache';
import { buildLogger } from '../libs/logger';

import type { Ticker } from './mercadoBitcoin';

const host = 'https://www.mercadobitcoin.net';

const getCached = withCache(httpClient.get);

const log = buildLogger('MercadoBitcoinLegacy');

const getTicker = async (ticker: string) => {
  log(`Loading ticker ${ticker}`);
  const url = `${host}/api/${ticker}/ticker`;
  const { ticker: data } = await getCached<{ ticker: Ticker }>(url);
  return data;
};

export default {
  getTicker,
};
