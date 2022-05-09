import googleSheets from '../providers/googleSheets';
import fixedService from './fixed';
import stockService from './stock';
import cryptoService from './crypto';

const services = {
  fixed: fixedService,
  stock: stockService,
  crypto: cryptoService,
};

const getAssetsList = assets =>
  assets ? assets.map(({ asset }) => asset) : [];

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

  const [fixedBalance, stockBalance, cryptoBalance] = await Promise.all([
    getFixedValues(assets.fixed),
    getStockValues(assets.stock),
    getCryptoValues(assets.crypto),
  ]);

  const totals = {
    fixed: getTotalValue(fixedBalance),
    stock: getTotalValue(stockBalance),
    crypto: getTotalValue(cryptoBalance),
  };

  return {
    balance: {
      fixed: { balance: fixedBalance, total: totals.fixed },
      stock: { balance: stockBalance, total: totals.stock },
      crypto: { balance: cryptoBalance, total: totals.crypto },
    },
    total: totals.fixed + totals.stock + totals.crypto,
  };
};

const deposit = async ({ value, portfolio, assetClass, assetName }) => {
  const portfolioList = await googleSheets.loadSheet('portfolio');
  const portfolioItem = portfolioList.find(
    item => item.class === assetClass && item.asset === assetName
  );

  const service = services[assetClass];
  const totalAssetValue = await service.getTotalPosition(assetName);

  const currentValue = totalAssetValue * portfolioItem[portfolio];
  const newValue = currentValue + value;
  const newRatio = newValue / totalAssetValue;

  await googleSheets.writeValue('portfolio', {
    index: { key: 'asset', value: assetName }, // TODO consider assetClass also
    target: { key: portfolio, value: newRatio },
  });
};

export default {
  getBalance,
  deposit,
};
