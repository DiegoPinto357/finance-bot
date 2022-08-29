import database from '../../providers/database';

const getDataFromDatabase = () =>
  database.find('assets', 'fixed', {}, { projection: { _id: 0 } });

const getTotal = balance =>
  balance.reduce((total, { value }) => total + value, 0);

const getBalance = async () => {
  const balance = await getDataFromDatabase();
  const total = getTotal(balance);
  return { balance, total };
};

const getTotalPosition = async assetName => {
  const { balance, total } = await getBalance();
  if (!assetName) {
    return total;
  }

  return balance.find(({ asset }) => asset === assetName).value;
};

const getAssetsList = async () => {
  const sheet = await getDataFromDatabase();
  return sheet.map(row => row.asset);
};

const setAssetValue = ({ asset, value }) =>
  database.updateOne('assets', 'fixed', { asset }, { $set: { value } });

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
    { $set: { value: newValue } }
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
