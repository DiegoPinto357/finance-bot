import googleSheets from '../../providers/googleSheets';
import fixedService from '../fixed/fixed.service';
import stockService from '../stock/stock.service';
import cryptoService from '../crypto/crypto.service';

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
  assetsWithTotalValues.map(item => {
    return {
      asset: item.asset,
      value: item.value * getAssetShare(assetsWithShares, item.asset),
    };
  });

const getFixedValues = (fixedTotalBalance, assets) => {
  const { balance } = fixedTotalBalance;
  const totalAssetValues = filterAssets(balance, assets);
  return mapValuesByShares(totalAssetValues, assets);
};

const getStockValues = (stockTotalBalance, assets) => {
  const balance = Object.entries(stockTotalBalance).map(([asset, value]) => ({
    asset,
    value,
  }));
  const totalAssetValues = filterAssets(balance, assets);
  return mapValuesByShares(totalAssetValues, assets);
};

const getCryptoValues = (cryptoTotalBalance, assets) => {
  const balance = Object.entries(cryptoTotalBalance).map(([asset, value]) => ({
    asset,
    value,
  }));
  const totalAssetValues = filterAssets(balance, assets);
  return mapValuesByShares(totalAssetValues, assets);
};

const getAssetsDataFromPortfolio = portfolio =>
  portfolio.reduce((obj, item) => {
    let assetClass = obj[item.class];
    if (!assetClass) {
      assetClass = [];
      obj[item.class] = assetClass;
    }
    assetClass.push({ asset: item.asset, share: item.share });
    return obj;
  }, {});

const getAssetsFromPortfolioName = (portfolios, portfolioName) => {
  const portfolio = portfolios
    .map(item => ({
      class: item.class,
      asset: item.asset,
      share: item[portfolioName],
    }))
    .filter(item => !portfolioName || item.share);

  return getAssetsDataFromPortfolio(portfolio);
};

const getTotalValue = assetValues =>
  assetValues.reduce((total, current) => total + current.value, 0);

const getBalancesByAssets = (assets, totalBalances) => {
  const fixedBalance = assets.fixed
    ? getFixedValues(totalBalances.fixed, assets.fixed)
    : [];
  const stockBalance = assets.stock
    ? getStockValues(totalBalances.stock, assets.stock)
    : [];
  const cryptoBalance = assets.crypto
    ? getCryptoValues(totalBalances.crypto, assets.crypto)
    : [];

  const totals = {
    fixed: getTotalValue(fixedBalance),
    stock: getTotalValue(stockBalance),
    crypto: getTotalValue(cryptoBalance),
  };

  const balance = {
    fixed: { balance: fixedBalance, total: totals.fixed },
    stock: { balance: stockBalance, total: totals.stock },
    crypto: { balance: cryptoBalance, total: totals.crypto },
  };

  return {
    balance,
    total: totals.fixed + totals.stock + totals.crypto,
  };
};

const getBalance = async portfolioName => {
  const portfolios = await googleSheets.loadSheet('portfolio');

  const assets = getAssetsFromPortfolioName(portfolios, portfolioName);

  const [fixedTotalBalance, stockTotalBalance, cryptoTotalBalance] =
    await Promise.all([
      assets.fixed ? fixedService.getBalance() : { balance: [], total: 0 },
      assets.stock ? stockService.getTotalPosition() : { total: 0 },
      assets.crypto ? cryptoService.getTotalPosition() : { total: 0 },
    ]);

  if (!portfolioName) {
    const reservedKeys = ['class', 'asset', 'save'];
    const names = Object.keys(portfolios[0]).filter(
      item => !reservedKeys.includes(item)
    );

    const balanceArray = await Promise.all(
      names.map(async portfolioName => {
        const currentAssets = getAssetsFromPortfolioName(
          portfolios,
          portfolioName
        );

        return {
          [portfolioName]: getBalancesByAssets(currentAssets, {
            fixed: fixedTotalBalance,
            stock: stockTotalBalance,
            crypto: cryptoTotalBalance,
          }),
        };
      })
    );

    const { balance, total } = balanceArray.reduce(
      ({ balance, total }, item) => ({
        balance: { ...balance, ...item },
        total: total + Object.values(item)[0].total,
      }),
      { balance: {}, total: 0 }
    );

    return {
      balance,
      total,
    };
  }

  return getBalancesByAssets(assets, {
    fixed: fixedTotalBalance,
    stock: stockTotalBalance,
    crypto: cryptoTotalBalance,
  });
};

const getShares = async portfolioName => {
  const sharesSheetTitle = `portfolio-${portfolioName}-shares`;
  const [{ balance, total }, portfolioShares] = await Promise.all([
    getBalance(portfolioName),
    googleSheets.loadSheet(sharesSheetTitle),
  ]);

  const balanceFlat = [
    ...balance.fixed.balance.map(item => ({ assetClass: 'fixed', ...item })),
    ...balance.stock.balance.map(item => ({ assetClass: 'stock', ...item })),
    ...balance.crypto.balance.map(item => ({ assetClass: 'crypto', ...item })),
  ];

  const shares = portfolioShares.reduce((result, shareItem) => {
    let asset;

    if (!shareItem.asset) {
      const assetsByClass = balanceFlat.filter(
        item => shareItem.assetClass === item.assetClass
      );
      const value = getTotalValue(assetsByClass);
      asset = {
        assetClass: shareItem.assetClass,
        asset: shareItem.assetClass,
        value,
        targetShare: shareItem.targetShare,
      };
    } else {
      asset = {
        ...balanceFlat.find(
          item =>
            shareItem.assetClass === item.assetClass &&
            shareItem.asset === item.asset
        ),
        targetShare: shareItem.targetShare,
      };
    }

    const currentShare = asset.value / total;
    const diffBRL = asset.targetShare * total - asset.value;

    result.push({ ...asset, currentShare, diffBRL });
    return result;
  }, []);

  return {
    shares: shares.sort((a, b) => b.diffBRL - a.diffBRL),
    total,
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

const flattenBalance = (balance, totals) =>
  balance.reduce((values, { asset, value }) => {
    values[asset] = value;
    totals[asset] = totals[asset] + value;
    return values;
  }, {});

const updateAbsoluteTable = async () => {
  const fixedAssets = await fixedService.getAssetsList();
  const stockAssets = ['float', 'br', 'fii', 'us'];
  const cryptoAssets = ['binanceBuffer', 'hodl', 'defi', 'defi2'];
  const assets = [...fixedAssets, ...stockAssets, ...cryptoAssets];
  const header = ['portfolios', ...assets, 'total'];

  const { balance } = await getBalance();

  const totalRow = assets.reduce(
    (totalRow, asset) => {
      totalRow[asset] = 0;
      return totalRow;
    },
    { portfolios: 'total', total: 0 }
  );

  const rows = Object.entries(balance).map(
    ([portfolio, { balance, total }]) => {
      const fixedValues = flattenBalance(balance.fixed.balance, totalRow);
      const stockValues = flattenBalance(balance.stock.balance, totalRow);
      const cryptoValues = flattenBalance(balance.crypto.balance, totalRow);

      totalRow.total = totalRow.total + total;
      return {
        portfolios: portfolio,
        ...fixedValues,
        ...stockValues,
        ...cryptoValues,
        total,
      };
    }
  );

  await googleSheets.setSheet('portfolio-absolute', header, [
    ...rows,
    totalRow,
  ]);
};

export default {
  getBalance,
  getShares,
  deposit,
  updateAbsoluteTable,
};
