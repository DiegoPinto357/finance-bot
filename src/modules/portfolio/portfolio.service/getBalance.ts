import fixedService, { FixedAssetData } from '../../fixed/fixed.service';
import stockService from '../../stock/stock.service';
import cryptoService from '../../crypto/crypto.service';
import { getPortfolioData, extractPortfolioNames } from './common';
import {
  AssetBalance,
  BalanceByAssetWithTotal,
  BalanceByPortfolioWithTotal,
} from './types';
import {
  StockAsset,
  CryptoAsset,
  AssetClass,
  AssetName,
  Portfolio,
} from '../../../types';

interface ShareItem {
  portfolio: Portfolio;
  value: number;
}

interface PortfolioData {
  assetClass: AssetClass;
  assetName: AssetName;
  shares: ShareItem[];
}

interface PortfolioShare {
  class: AssetClass;
  asset: AssetName;
  share: number;
}

interface AssetShare {
  asset: AssetName;
  share: number;
}

type AssetsShares = {
  [key in AssetClass]: AssetShare[];
};

interface FixedBalance {
  balance: FixedAssetData[];
  total: number;
}

type StockAssetTotals = {
  [key in StockAsset]: number;
};

interface StockTotals extends StockAssetTotals {
  total: number;
}

type CryptoAssetTotals = {
  [key in CryptoAsset]: number;
};

interface CryptoTotals extends CryptoAssetTotals {
  total: number;
}

interface AssetsTotals {
  fixed: FixedBalance;
  stock: StockTotals;
  crypto: CryptoTotals;
}

const getAssetsDataFromPortfolio = (portfolio: PortfolioShare[]) =>
  portfolio.reduce((obj, item) => {
    let assetClass = obj[item.class];
    if (!assetClass) {
      assetClass = [];
      obj[item.class] = assetClass;
    }
    assetClass.push({ asset: item.asset, share: item.share });
    return obj;
  }, {} as AssetsShares);

const getAssetsFromPortfolioName = (
  portfolios: PortfolioData[],
  portfolioName?: Portfolio | Portfolio[]
) => {
  const portfolio = portfolios
    .map(item => {
      const portfolioShare = item.shares.find(
        share => share.portfolio === portfolioName
      );
      return {
        class: item.assetClass,
        asset: item.assetName,
        share: portfolioShare ? portfolioShare.value : 0,
      };
    })
    .filter(item => !portfolioName || item.share);

  return getAssetsDataFromPortfolio(portfolio);
};

const getAssetsList = (assets: AssetShare[]) =>
  assets ? assets.map(({ asset }) => asset) : [];

const filterAssets = (balance: AssetBalance[], assets: AssetShare[]) => {
  const assetList = getAssetsList(assets);
  return balance.filter(item => assetList.includes(item.asset));
};

const getAssetShare = (assets: AssetShare[], assetName: AssetName) =>
  assets.find(item => item.asset === assetName)?.share || 0;

const mapValuesByShares = (
  assetsWithTotalValues: AssetBalance[],
  assetShares: AssetShare[]
) =>
  assetsWithTotalValues.map(item => {
    return {
      asset: item.asset,
      liquidity: item.liquidity,
      value: item.value * getAssetShare(assetShares, item.asset),
    };
  });

const getFixedValues = (
  fixedTotalBalance: FixedBalance,
  assetShares: AssetShare[]
) => {
  const { balance } = fixedTotalBalance;
  const totalAssetValues = filterAssets(balance, assetShares);
  return mapValuesByShares(totalAssetValues, assetShares);
};

const getStockValues = (
  stockTotalBalance: StockTotals,
  assetShares: AssetShare[]
) => {
  const balance = Object.entries(stockTotalBalance).map(([asset, value]) => ({
    asset,
    value,
  })) as AssetBalance[];
  const totalAssetValues = filterAssets(balance, assetShares);
  return mapValuesByShares(totalAssetValues, assetShares);
};

const getCryptoValues = (
  cryptoTotalBalance: CryptoTotals,
  assetShares: AssetShare[]
) => {
  const balance = Object.entries(cryptoTotalBalance).map(([asset, value]) => ({
    asset,
    value,
  })) as AssetBalance[];
  const totalAssetValues = filterAssets(balance, assetShares);
  return mapValuesByShares(totalAssetValues, assetShares);
};

const getTotalValue = (assetValues: AssetBalance[]) =>
  assetValues.reduce((total, current) => total + current.value, 0);

const getBalancesByAssets = (
  shares: AssetsShares,
  totalBalances: AssetsTotals
) => {
  const fixedBalance = shares.fixed
    ? getFixedValues(totalBalances.fixed, shares.fixed)
    : [];
  const stockBalance = shares.stock
    ? getStockValues(totalBalances.stock, shares.stock)
    : [];
  const cryptoBalance = shares.crypto
    ? getCryptoValues(totalBalances.crypto, shares.crypto)
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

export default async (portfolioName?: Portfolio | Portfolio[]) => {
  // TODO remove type cast as getPortfolioData type is defined
  const portfolios = await (<Promise<PortfolioData[]>>getPortfolioData());

  const assets = getAssetsFromPortfolioName(portfolios, portfolioName);

  const [fixedTotalBalance, stockTotalBalance, cryptoTotalBalance] =
    await Promise.all([
      // TODO provide assets to getters to prevent getting data from all assets
      assets.fixed ? fixedService.getBalance() : { balance: [], total: 0 },
      assets.stock
        ? stockService.getTotalPosition()
        : ({ total: 0 } as StockTotals),
      assets.crypto
        ? cryptoService.getTotalPosition()
        : ({ total: 0 } as CryptoTotals),
    ]);

  if (portfolioName && !Array.isArray(portfolioName)) {
    return getBalancesByAssets(assets, {
      fixed: fixedTotalBalance,
      stock: stockTotalBalance,
      crypto: cryptoTotalBalance,
    }) as BalanceByAssetWithTotal;
  }

  let names: Portfolio[];

  if (Array.isArray(portfolioName)) {
    names = portfolioName;
  } else {
    names = extractPortfolioNames(portfolios);
  }

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
    { balance: {}, total: 0 } as BalanceByPortfolioWithTotal
  );

  return {
    balance,
    total,
  };
};
