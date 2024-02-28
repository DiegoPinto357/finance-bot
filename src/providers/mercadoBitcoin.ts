import httpClient from '../libs/httpClient';
import { withCache } from '../libs/cache';
import { buildLogger } from '../libs/logger';

type Account = {
  id: string;
};

export type AssetBalance = {
  symbol: string;
  total: string;
  available: string;
  on_hold: string;
};

export type Ticker = {
  pair: string;
  high: string;
  low: string;
  vol: string;
  last: string;
  buy: string;
  sell: string;
  open: string;
  date: number;
};

const host = 'https://api.mercadobitcoin.net/api/v4';
const login = process.env.MERCADO_BITCOIN_API_KEY;
const password = process.env.MERCADO_BITCOIN_API_SECRET;

const getCached = withCache(httpClient.get);

const log = buildLogger('MercadoBitcoin');

let accessToken: string | undefined;
let accessTokenExpiration: number | undefined;

const authorize = async () => {
  log('Authorizing');
  const { access_token, expiration } = await httpClient.post(
    `${host}/authorize`,
    {
      login,
      password,
    }
  );
  accessToken = access_token;
  accessTokenExpiration = expiration * 1000;
};

const getAccountBalance = async () => {
  const nowWithMargin = Date.now() + 10 * 1000;
  const isTokenExpired =
    accessTokenExpiration && nowWithMargin > accessTokenExpiration;
  console.log({ isTokenExpired });
  if (!accessToken || isTokenExpired) {
    await authorize();
  }

  const headers = { Authorization: `Bearer ${accessToken}` };

  log('Getting accounts');
  const accounts = await httpClient.get<Account[]>(`${host}/accounts`, {
    headers,
  });
  const { id: accountId } = accounts[0];

  log('Getting account balance');
  const balances = await httpClient.get<AssetBalance[]>(
    `${host}/accounts/${accountId}/balances`,
    {
      headers,
    }
  );

  return balances.filter(balance => parseFloat(balance.total) > 0);
};

const getTickers = async (tickers: string[]) => {
  log('Loading tickers');
  const symbols = tickers.reduce(
    (symbols, ticker) =>
      symbols === '' ? `${ticker}-BRL` : `${symbols},${ticker}-BRL`,
    ''
  );
  const url = `${host}/tickers?symbols=${symbols}`;
  const data = await getCached<Ticker[]>(url);
  return data;
};

export default {
  getAccountBalance,
  getTickers,
};
