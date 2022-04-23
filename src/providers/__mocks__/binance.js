import { promises as fs } from 'fs';
import path from 'path';

const mockDir = `${path.resolve()}/mockData/binance/`;

const getAccountInformation = jest.fn(async () => {
  const filename = `${mockDir}accountBalance.json`;
  const balances = JSON.parse(await fs.readFile(filename, 'utf-8'));
  return { balances };
});

const getSymbolPriceTicker = jest.fn();

const getAssetPriceWithBridge = jest.fn(async ({ asset }) => {
  const filename = `${mockDir}assetPrices.json`;
  const prices = JSON.parse(await fs.readFile(filename, 'utf-8'));
  const { price } = prices.find(item => item.asset === asset);
  return price;
});

export default {
  getAccountInformation,
  getSymbolPriceTicker,
  getAssetPriceWithBridge,
};
