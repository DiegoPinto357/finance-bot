import { promises as fs } from 'fs';
import path from 'path';

const mockDir = `${path.resolve()}/mockData/coinMarketCap/`;

const getSymbolPrice = jest.fn(async symbol => {
  const filename = `${mockDir}symbolPrices.json`;
  const tokens = JSON.parse(await fs.readFile(filename, 'utf-8'));
  const { price } = tokens.find(item => item.asset === symbol);
  return price;
});

export default {
  getSymbolPrice,
};
