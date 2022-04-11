import GoogleSheets from '../providers/GoogleSheets';
import config from '../config';
import fixedService from './fixed';
import stockService from './stock';

const googleSheets = new GoogleSheets();

const getAssetsList = assets => assets.map(({ asset }) => asset);

const filterAssets = (balance, assets) => {
  const assetList = getAssetsList(assets);
  return balance.filter(item => assetList.includes(item.asset));
};

const getAssetShare = (assets, assetName) =>
  assets.find(item => item.asset === assetName).share;

const mapValuesByShares = (assetsWithTotalValues, assetsWithShares) =>
  assetsWithTotalValues.map(item => ({
    asset: item.asset,
    value: item.value * getAssetShare(assetsWithShares, item.asset),
  }));

const getValuesFromAssets = async (assets, getBalanceFunc) => {
  const { balance } = await getBalanceFunc();
  const totalAssetValues = filterAssets(balance, assets);
  return mapValuesByShares(totalAssetValues, assets);
};

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

  const assets = portfolio.reduce((obj, asset) => {
    let assetClass = obj[asset.class];
    if (!assetClass) {
      assetClass = [];
      obj[asset.class] = assetClass;
    }
    assetClass.push({ asset: asset.asset, share: asset.share });
    return obj;
  }, {});

  const fixedValues = await getValuesFromAssets(
    assets.fixed,
    fixedService.getBalance
  );

  const stockValues = {}; // await getValuesFromAssets(
  //   assets.stock,
  //   stockService.getBalance
  // );

  return { balance: { fixed: fixedValues, stock: stockValues }, total: 0 };
};

export default {
  getBalance,
};
