import GoogleSheets from '../providers/GoogleSheets';
import config from '../config';

const googleSheets = new GoogleSheets();

const getTotal = balance =>
  balance.reduce((total, { value }) => total + value, 0);

const getBalance = async () => {
  await googleSheets.loadDocument(config.googleSheets.assetsDocId);
  const balance = await googleSheets.loadSheet('fixed');
  const total = getTotal(balance);
  return { balance, total };
};

const getTotalPosition = async () => await (await getBalance()).total;

export default {
  getBalance,
  getTotalPosition,
};
