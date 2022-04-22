import googleSheets from '../providers/GoogleSheets';
import fixedService from './fixed';
import stockService from './stock';
import cryptoService from './crypto';

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

const getFixedValues = async assets => {
  const { balance } = await fixedService.getBalance();
  const totalAssetValues = filterAssets(balance, assets);
  return mapValuesByShares(totalAssetValues, assets);
};

const getStockValues = async assets => {
  const totals = await stockService.getTotalPosition();
  const balance = Object.entries(totals).map(([asset, value]) => ({
    asset,
    value,
  }));
  const totalAssetValues = filterAssets(balance, assets);
  return mapValuesByShares(totalAssetValues, assets);
};

const getCryptoValues = async assets => {
  const totals = await cryptoService.getTotalPosition();
  const balance = Object.entries(totals).map(([asset, value]) => ({
    asset,
    value,
  }));
  const totalAssetValues = filterAssets(balance, assets);
  return mapValuesByShares(totalAssetValues, assets);
};

const getTotalValue = assetValues =>
  assetValues.reduce((total, current) => total + current.value, 0);

const getBalance = async portfolioName => {
  const portfolios = await googleSheets.loadSheet('portfolio');

  const portfolio = portfolios
    .map(item => ({
      class: item.class,
      asset: item.asset,
      share: item[portfolioName],
    }))
    .filter(item => item.share);

  // TODO move to function
  const assets = portfolio.reduce((obj, asset) => {
    let assetClass = obj[asset.class];
    if (!assetClass) {
      assetClass = [];
      obj[asset.class] = assetClass;
    }
    assetClass.push({ asset: asset.asset, share: asset.share });
    return obj;
  }, {});

  const fixedValues = await getFixedValues(assets.fixed);
  const stockValues = await getStockValues(assets.stock);
  const cryptoValues = await getCryptoValues(assets.crypto);

  const total =
    getTotalValue(fixedValues) +
    getTotalValue(stockValues) +
    getTotalValue(cryptoValues);

  return {
    balance: { fixed: fixedValues, stock: stockValues, crypto: cryptoValues },
    total,
  };
};

export default {
  getBalance,
};
