import database from '../../providers/database';

const getDataFromDatabase = assetName =>
  database.find('assets', 'fixed', assetName ? { asset: assetName } : {}, {
    projection: { _id: 0 },
  });

const getTotal = balance =>
  balance.reduce((total, { value }) => total + value, 0);

const getBalance = async assetName => {
  const balance = await getDataFromDatabase(assetName);
  const total = getTotal(balance);
  return { balance, total };
};

const getTotalPosition = async assetName => {
  const { balance, total } = await getBalance();
  if (!assetName) {
    return total;
  }

  const filteredBalance = balance.find(({ asset }) => asset === assetName);
  return filteredBalance ? filteredBalance.value : 0;
};

const getAssetsList = async () => {
  const sheet = await getDataFromDatabase();
  return sheet.map(row => row.asset);
};

const setAssetValue = ({ asset, value }) =>
  database.updateOne(
    'assets',
    'fixed',
    { asset },
    { $setOnInsert: { asset }, $set: { value } },
    { upsert: true }
  );

const deposit = async ({ asset, value }) => {
  const currentValue = await getTotalPosition(asset);
  const newValue = currentValue + value;

  if (newValue < 0) {
    return { status: 'notEnoughFunds' };
  }

  await database.updateOne(
    'assets',
    'fixed',
    { asset },
    { $setOnInsert: { asset }, $set: { value: newValue } },
    { upsert: true }
  );

  return { status: 'ok' };
};

export default {
  getBalance,
  getTotalPosition,
  getAssetsList,
  setAssetValue,
  deposit,
};
