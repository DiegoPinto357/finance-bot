import { promises as fs } from 'fs';
import path from 'path';

const mockDir = `${path.resolve()}/mockData/binance/`;

let accountData;

async function loadAccountData() {
  const filename = `${mockDir}accountBalance.json`;
  accountData = JSON.parse(await fs.readFile(filename, 'utf-8'));
  return accountData;
}

const getAccountInformation = jest.fn(async () => {
  const balances = accountData ? accountData : await loadAccountData();
  return { balances };
});

const getSymbolPriceTicker = jest.fn();

const getAssetPriceWithBridge = jest.fn(async ({ asset }) => {
  const filename = `${mockDir}assetPrices.json`;
  const prices = JSON.parse(await fs.readFile(filename, 'utf-8'));
  const { price } = prices.find(item => item.asset === asset);
  return price;
});

const simulateBRLDeposit = async value => {
  const balances = accountData ? accountData : await loadAccountData();
  const asset = balances.find(({ asset }) => asset === 'BRL');
  asset.free = `${parseFloat(asset.free) + value}`;
};

const resetMockValues = () => (accountData = null);

export default {
  getAccountInformation,
  getSymbolPriceTicker,
  getAssetPriceWithBridge,
  simulateBRLDeposit,
  resetMockValues,
};
