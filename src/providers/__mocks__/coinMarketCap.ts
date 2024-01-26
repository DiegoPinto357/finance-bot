import { promises as fs } from 'fs';
import path from 'path';

const mockDir = `${path.resolve()}/mockData/coinMarketCap/`;

type AssetData = {
  asset: string;
  price: number;
};

const getSymbolPrice = jest.fn(async symbol => {
  const filename = `${mockDir}symbolPrices.json`;
  const tokens = JSON.parse(
    await fs.readFile(filename, 'utf-8')
  ) as AssetData[];

  const token = tokens.find(item => item.asset === symbol);
  if (!token) return 0;

  const { price } = token;
  return price;
});

export default {
  getSymbolPrice,
};
