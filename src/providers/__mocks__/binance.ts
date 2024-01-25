import { promises as fs } from 'fs';
import path from 'path';

const mockDir = `${path.resolve()}/mockData/binance/`;

type AssetData = {
  asset: string;
  free: string;
  locked: string;
};

type AssetPrice = {
  asset: string;
  price: number;
};

let accountData: AssetData[] | null;

const loadAccountData = async () => {
  const filename = `${mockDir}accountBalance.json`;
  accountData = JSON.parse(await fs.readFile(filename, 'utf-8')) as AssetData[];
  return accountData;
};

const getAccountInformation = jest.fn(async () => {
  const balances = accountData ? accountData : await loadAccountData();
  return { balances };
});

const getAssetPrice = jest.fn(async ({ asset }: { asset: string }) => {
  const filename = `${mockDir}assetPrices.json`;
  const prices: AssetPrice[] = JSON.parse(await fs.readFile(filename, 'utf-8'));
  const assetPriceData = prices.find(item => item.asset === asset);
  return assetPriceData?.price;
});

type EarnAssetData = {
  asset: string;
  totalAmount: string;
  amount: string;
};

const getEarnPosition = jest.fn(async () => {
  const stakingData: EarnAssetData[] = JSON.parse(
    await fs.readFile(`${mockDir}stakingBalance.json`, 'utf-8')
  );
  const savingsData: EarnAssetData[] = JSON.parse(
    await fs.readFile(`${mockDir}savingsBalance.json`, 'utf-8')
  );
  return [
    ...stakingData.map(item => ({ ...item, amount: parseFloat(item.amount) })),
    ...savingsData.map(({ asset, totalAmount }) => ({
      asset,
      amount: parseFloat(totalAmount),
    })),
  ];
});

const simulateDeposit = async (assetName: string, amount: number) => {
  const balances = accountData ? accountData : await loadAccountData();
  const asset = balances.find(item => item.asset === assetName);
  if (asset) {
    asset.free = `${parseFloat(asset.free) + amount}`;
  } else {
    throw new Error(`Asset ${asset} not found`);
  }
};

const simulateBRLDeposit = async (value: number) => {
  const balances = accountData ? accountData : await loadAccountData();
  const asset = balances.find(({ asset }) => asset === 'BRL');
  if (asset) {
    asset.free = `${parseFloat(asset.free) + value}`;
  } else {
    throw new Error('BRL asset not found');
  }
};

const resetMockValues = () => (accountData = null);

export default {
  getAccountInformation,
  getAssetPrice,
  getEarnPosition,

  simulateDeposit,
  simulateBRLDeposit,
  resetMockValues,
};
