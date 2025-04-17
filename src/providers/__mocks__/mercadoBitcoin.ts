import path from 'path';
import { promises as fs } from 'fs';
import tickers from '../../../mockData/mercadoBitcoin/tickers.json';

import type { AssetBalance, Ticker } from '../mercadoBitcoin';

const mockDir = `${path.resolve()}/mockData/mercadoBitcoin/`;

let accountBalance: AssetBalance[] | undefined;

const loadAccountData = async () => {
  const filename = `${mockDir}accountBalance.json`;
  accountBalance = JSON.parse(await fs.readFile(filename, 'utf-8'));
  return accountBalance;
};

const getAccountBalance = jest.fn(async () => {
  if (!accountBalance) {
    await loadAccountData();
  }
  return accountBalance;
});

const getTickers = jest.fn((symbols: string[]) => {
  const allTickers: Ticker[] = tickers;
  const pairs = symbols.map(symbol => `${symbol}-BRL`);
  return Promise.resolve(
    allTickers.filter(ticker => pairs.includes(ticker.pair))
  );
});

const getCandles = jest.fn(async (symbol: string) => {
  const data = tickers.find(ticker => ticker.pair === `${symbol}-BRL`);
  if (!data) {
    return {};
  }
  const { last, high, low, open, vol } = data;
  return {
    c: [last],
    h: [high],
    l: [low],
    o: [open],
    t: [0],
    v: [vol],
  };
});

const simulateBRLDeposit = async (value: number) => {
  if (!accountBalance) {
    await loadAccountData();
  }
  const asset = accountBalance!.find(({ symbol }) => symbol === 'BRL');
  if (asset) {
    asset.total = `${parseFloat(asset.total) + value}`;
    asset.available = `${parseFloat(asset.available) + value}`;
  }
};

export default {
  getAccountBalance,
  getTickers,
  getCandles,

  simulateBRLDeposit,
};
