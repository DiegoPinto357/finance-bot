import GoogleSheets from '../providers/GoogleSheets';
import config from '../config';

const googleSheets = new GoogleSheets();

const getBalance = async portfolioName => {
  await googleSheets.loadDocument(config.googleSheets.assetsDocId);
  const portfolios = await googleSheets.loadSheet('portfolio');

  const portfolio = portfolios
    .map(item => ({
      class: item.class,
      asset: item.asset,
      share: item[portfolioName],
    }))
    .filter(item => item.share);

  return { balance: portfolio, total: 0 };
};

export default {
  getBalance,
};
