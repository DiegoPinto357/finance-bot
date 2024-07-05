import fixedService from '../../fixed/fixed.service';
import stockService from '../../stock/stock.service';
import cryptoService from '../../crypto/crypto.service';
import { getPortfolioData, extractPortfolioNames } from './common';

import type {
  BalanceByAsset,
  BalanceByAssetWithTotal,
  BalanceByPortfolioWithTotal,
  PortfolioData,
} from './types';
import type {
  CryptoAsset,
  AssetClass,
  AssetName,
  AssetBalance,
  Portfolio,
  FixedAssetBalance,
  StockAssetBalance,
  CryptoAssetBalance,
} from '../../../types';
import { StockAssetType } from '../../../schemas';

type PortfolioShare = {
  class: AssetClass;
  asset: AssetName;
  share: number;
};

type AssetShare = {
  asset: AssetName;
  share: number;
};

type AssetsShares = {
  [key in AssetClass]: AssetShare[];
};

type StockAssetTotals = Record<StockAssetType, number>;

type StockTotals = StockAssetTotals & {
  total: number;
};

type CryptoAssetTotals = {
  [key in CryptoAsset]: number;
};

type CryptoTotals = CryptoAssetTotals & {
  total: number;
};

type FixedBalanceWithTotal = Required<BalanceByAsset>['fixed'];
type StockBalanceWithTotal = Required<BalanceByAsset>['stock'];
type CryptoBalanceWithTotal = Required<BalanceByAsset>['crypto'];

const getAssetsDataFromPortfolio = (portfolioShares: PortfolioShare[]) =>
  portfolioShares.reduce((obj, item) => {
    let assetClass = obj[item.class];
    if (!assetClass) {
      assetClass = [];
      obj[item.class] = assetClass;
    }
    assetClass.push({ asset: item.asset, share: item.share });
    return obj;
  }, {} as AssetsShares);

const getPortfolioShares = (
  portfolioData: PortfolioData[],
  portfolioName?: Portfolio | Portfolio[]
) => {
  const portfolioShares = portfolioData
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

  return getAssetsDataFromPortfolio(portfolioShares);
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
  fixedTotalBalance: FixedBalanceWithTotal,
  assetShares: AssetShare[]
) => {
  const { balance } = fixedTotalBalance;
  const totalAssetValues = filterAssets(balance, assetShares);
  return mapValuesByShares(
    totalAssetValues,
    assetShares
  ) as FixedAssetBalance[];
};

const getStockValues = (
  stockTotalBalance: StockBalanceWithTotal,
  assetShares: AssetShare[]
) => {
  const { balance } = stockTotalBalance;
  const totalAssetValues = filterAssets(balance, assetShares);
  return mapValuesByShares(
    totalAssetValues,
    assetShares
  ) as StockAssetBalance[];
};

const getCryptoValues = (
  cryptoTotalBalance: CryptoBalanceWithTotal,
  assetShares: AssetShare[]
) => {
  const { balance } = cryptoTotalBalance;
  const totalAssetValues = filterAssets(balance, assetShares);
  return mapValuesByShares(
    totalAssetValues,
    assetShares
  ) as CryptoAssetBalance[];
};

const getTotalValue = (assetValues?: AssetBalance[]) =>
  (assetValues || []).reduce((total, current) => total + current.value, 0);

const formatBalance = (rawBalance?: StockTotals | CryptoTotals) => {
  if (!rawBalance) return;
  return Object.entries(rawBalance).reduce(
    ({ balance, total }, [asset, value]) => {
      if (asset === 'total') return { balance, total };
      balance.push({ asset: asset as StockAssetType, value });
      total += value;
      return { balance, total };
    },
    { balance: [], total: 0 } as {
      balance: { asset: StockAssetType | CryptoAsset; value: number }[];
      total: number;
    }
  );
};

const fetchBalances = async (shares: AssetsShares) => {
  const [fixed, rawStock, rawCrypto] = await Promise.all([
    // TODO provide assets to getters to prevent getting data from all assets
    shares.fixed ? fixedService.getBalance() : undefined,
    shares.stock ? stockService.getTotalPosition() : undefined,
    shares.crypto ? cryptoService.getTotalPosition() : undefined,
  ]);

  return {
    fixed,
    stock: formatBalance(rawStock) as StockBalanceWithTotal,
    crypto: formatBalance(rawCrypto) as CryptoBalanceWithTotal,
  };
};

const getBalancesByAssetShares = async (
  balances: BalanceByAsset,
  assets: AssetsShares
): Promise<BalanceByAssetWithTotal> => {
  const fixedBalance = balances.fixed
    ? getFixedValues(balances.fixed, assets.fixed)
    : [];
  const stockBalance = balances.stock
    ? getStockValues(balances.stock, assets.stock)
    : [];
  const cryptoBalance = balances.crypto
    ? getCryptoValues(balances.crypto, assets.crypto)
    : [];

  const totals = {
    fixed: getTotalValue(fixedBalance),
    stock: getTotalValue(stockBalance),
    crypto: getTotalValue(cryptoBalance),
  };

  const emptyBalance = { balance: [], total: 0 };

  const balance = {
    fixed: balances.fixed
      ? {
          balance: fixedBalance,
          total: totals.fixed,
        }
      : emptyBalance,
    stock: balances.stock
      ? {
          balance: stockBalance,
          total: totals.stock,
        }
      : emptyBalance,
    crypto: balances.crypto
      ? {
          balance: cryptoBalance,
          total: totals.crypto,
        }
      : emptyBalance,
  };

  return {
    balance,
    total: totals.fixed + totals.stock + totals.crypto,
  };
};

const getBalanceSingle = async (portfolioName: Portfolio) => {
  const portfolios = await getPortfolioData();
  const shares = getPortfolioShares(portfolios, portfolioName);
  const balances = await fetchBalances(shares);
  return await getBalancesByAssetShares(balances, shares);
};

const getBalanceMulti = async (portfolioNames?: Portfolio[]) => {
  const portfolios = await getPortfolioData();

  const names = portfolioNames
    ? portfolioNames
    : extractPortfolioNames(portfolios);

  const assets = getPortfolioShares(portfolios, portfolioNames);
  const balances = await fetchBalances(assets);

  const balanceArray = await Promise.all(
    names.map(async portfolioName => {
      const currentAssets = getPortfolioShares(portfolios, portfolioName);

      return {
        [portfolioName]: await getBalancesByAssetShares(
          balances,
          currentAssets
        ),
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
  } as BalanceByPortfolioWithTotal;
};

function getBalance(portfolioName: Portfolio): Promise<BalanceByAssetWithTotal>;
function getBalance(
  portfolioName?: Portfolio[]
): Promise<BalanceByPortfolioWithTotal>;
async function getBalance(portfolioName?: Portfolio | Portfolio[]) {
  if (portfolioName && !Array.isArray(portfolioName)) {
    return await getBalanceSingle(portfolioName);
  }

  return getBalanceMulti(portfolioName);
}

export default getBalance;
