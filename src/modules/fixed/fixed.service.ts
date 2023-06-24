import database from '../../providers/database';
import { FixedAsset } from '../../types';

interface AssetData {
  asset: FixedAsset;
  value: number;
}

const getDataFromDatabase = (assetName?: FixedAsset) =>
  database.find<AssetData[]>(
    'assets',
    'fixed',
    assetName ? { asset: assetName } : {},
    {
      projection: { _id: 0 },
    }
  );

const getTotal = (balance: AssetData[]) =>
  balance.reduce((total, { value }) => total + value, 0);

const getBalance = async (assetName?: FixedAsset) => {
  const balance = await getDataFromDatabase(assetName);
  const total = getTotal(balance);
  return { balance: balance.sort((a, b) => b.value - a.value), total };
};

const getTotalPosition = async (assetName?: FixedAsset) => {
  const { balance, total } = await getBalance();
  if (!assetName) {
    return total;
  }

  // TODO when assetName is provided, get specific balance rather than get all and filter later
  const filteredBalance = balance.find(({ asset }) => asset === assetName);
  return filteredBalance ? filteredBalance.value : 0;
};

const getAssetsList = async () => {
  const sheet = await getDataFromDatabase();
  return sheet.map(row => row.asset);
};

const setAssetValue = ({ asset, value }: AssetData) =>
  database.updateOne<AssetData>(
    'assets',
    'fixed',
    { asset },
    { $setOnInsert: { asset }, $set: { value } },
    { upsert: true }
  );

const deposit = async ({ asset, value }: AssetData) => {
  const currentValue = await getTotalPosition(asset);
  const newValue = currentValue + value;

  if (newValue < 0) {
    return { status: 'notEnoughFunds' };
  }

  await database.updateOne<AssetData>(
    'assets',
    'fixed',
    { asset },
    { $setOnInsert: { asset }, $set: { value: newValue } },
    { upsert: true }
  );

  return { status: 'ok' };
};

const removeAsset = async (asset: FixedAsset) => {
  const funds = await getTotalPosition(asset);

  if (funds !== 0) {
    return { status: 'assetHasFunds' };
  }

  await database.deleteOne('assets', 'fixed', { asset });

  return { status: 'ok' };
};

export default {
  getBalance,
  getTotalPosition,
  getAssetsList,
  setAssetValue,
  deposit,
  removeAsset,
};
