import { AssetName, Portfolio } from '../../../types';

export interface AssetBalance {
  asset: AssetName;
  value: number;
}

export interface BalanceByAsset {
  fixed: {
    balance: AssetBalance[];
    total: number;
  };
  stock: {
    balance: AssetBalance[];
    total: number;
  };
  crypto: {
    balance: AssetBalance[];
    total: number;
  };
}

export interface BalanceByAssetWithTotal {
  balance: BalanceByAsset;
  total: number;
}

type BalanceByPortfolio = {
  [key in Portfolio]: BalanceByAssetWithTotal;
};

export interface BalanceByPortfolioWithTotal {
  balance: BalanceByPortfolio;
  total: number;
}
