import googleSheets from '../../providers/GoogleSheets';

const getTotal = balance =>
  balance.reduce((total, { value }) => total + value, 0);

const getBalance = async () => {
  const balance = await googleSheets.loadSheet('fixed');
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

export default {
  getBalance,
  getTotalPosition,
};
