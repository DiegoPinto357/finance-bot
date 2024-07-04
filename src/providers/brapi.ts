import httpClient from '../libs/httpClient';
import { withCache } from '../libs/cache';
import { buildLogger } from '../libs/logger';

const log = buildLogger('Brapi');

const accessToken = process.env.BRAPI_ACCESS_TOKEN;
const headers = { Authorization: `Bearer ${accessToken}` };

const baseUrl = 'https://brapi.dev/api';

const getCached = withCache(httpClient.get, {
  dataNode: 'results',
  requiredFields: ['[0].regularMarketChange', '[0].regularMarketPrice'],
});

type Quote = {
  results: {
    regularMarketPrice: number;
    regularMarketChange: number;
  }[];
};

const getQuote = async (symbol: string) => {
  log(`Loading quote for ${symbol}`);
  const url = `${baseUrl}/quote/${symbol}`;
  const { results } = await getCached<Quote>(url, { headers });
  const price = results[0].regularMarketPrice;
  const change = results[0].regularMarketChange;
  return { price, change };
};

export default {
  getQuote,
};
