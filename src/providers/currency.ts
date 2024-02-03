import httpClient from '../libs/httpClient';
import { withCache } from '../libs/cache';
import { buildLogger } from '../libs/logger';

const log = buildLogger('Currency API');

const getCached = withCache(httpClient.get);

type Quote = Record<string, { bid: string; ask: string }>;

const getQuote = async (currency: string) => {
  log(`Loading quote for ${currency}`);
  const url = `http://economia.awesomeapi.com.br/json/last/${currency}-BRL`;
  const response = await getCached<Quote>(url);
  const ask = parseFloat(response[`${currency}BRL`].ask);
  const bid = parseFloat(response[`${currency}BRL`].bid);
  return (ask + bid) / 2;
};

export default {
  getQuote,
};
