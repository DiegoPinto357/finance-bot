import { promises as fs } from 'fs';
import path from 'path';

const mockDir = `${path.resolve()}/mockData/brapi/`;

type Quote = {
  symbol: string;
  price: number;
  change: number;
};

const getQuote = jest.fn(async symbol => {
  const filename = `${mockDir}tickers.json`;
  const tickers = JSON.parse(await fs.readFile(filename, 'utf-8')) as Quote[];
  const assetData = tickers.find(item => item.symbol === symbol);

  if (!assetData) {
    return { price: 0, change: 0 };
  }

  const { price, change } = assetData;
  return { price, change };
});

export default {
  getQuote,
};
