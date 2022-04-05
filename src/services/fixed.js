import googleSheets from '../providers/googleSheets';

const getTotal = balance =>
  balance.reduce((total, { value }) => total + value, 0);

const getBalance = async () => {
  const balance = await googleSheets.loadSheet('fixed');
  const total = getTotal(balance);
  return { balance, total };
};

export default {
  getBalance,
};
