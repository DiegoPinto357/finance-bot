import database from '../../providers/database';
import { FixedAsset, FixedAssetBalance } from '../../types';

const getDataFromDatabase = (assetName?: FixedAsset) =>
  database.find<FixedAssetBalance[]>(
    'assets',
    'fixed',
    assetName ? { asset: assetName } : {},
    {
      projection: { _id: 0 },
    }
  );

const getTotal = (balance: FixedAssetBalance[]) =>
  balance.reduce((total, { value }) => total + value, 0);

const getBalance = async (assetName?: FixedAsset) => {
  const balance = await getDataFromDatabase(assetName);
  const total = getTotal(balance);
  return { balance: balance.sort((a, b) => b.value - a.value), total };
};

const getAssetPosition = async (assetName: FixedAsset) => {
  const { balance } = await getBalance(assetName);
  return balance && balance[0] ? balance[0].value : 0;
};

const getTotalPosition = async () => {
  const { balance, total } = await getBalance();
  const withLiquidity = balance
    .filter(({ liquidity }) => liquidity)
    .reduce((total, { value }) => total + value, 0);
  const withoutLiquidity = total - withLiquidity;
  return { withLiquidity, withoutLiquidity, total };
};

const getAssetsList = async () => {
  const sheet = await getDataFromDatabase();
  return sheet.map(row => row.asset);
};

const setAssetValue = ({ asset, value }: FixedAssetBalance) =>
  database.updateOne<FixedAssetBalance>(
    'assets',
    'fixed',
    { asset },
    { $setOnInsert: { asset }, $set: { value } },
    { upsert: true }
  );

const deposit = async ({ asset, value }: FixedAssetBalance) => {
  const currentValue = await getAssetPosition(asset);
  const newValue = currentValue + value;

  if (newValue < 0) {
    return { status: 'notEnoughFunds' };
  }

  await database.updateOne<FixedAssetBalance>(
    'assets',
    'fixed',
    { asset },
    { $setOnInsert: { asset }, $set: { value: newValue } },
    { upsert: true }
  );

  return { status: 'ok' };
};

const removeAsset = async (asset: FixedAsset) => {
  const funds = await getAssetPosition(asset);

  if (funds !== 0) {
    return { status: 'assetHasFunds' };
  }

  await database.deleteOne('assets', 'fixed', { asset });

  return { status: 'ok' };
};

export default {
  getBalance,
  getAssetPosition,
  getTotalPosition,
  getAssetsList,
  setAssetValue,
  deposit,
  removeAsset,
};
