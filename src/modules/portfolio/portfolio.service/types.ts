import { AssetName, Portfolio } from '../../../types';

export interface AssetBalance {
  asset: AssetName;
  value: number;
}

export interface Balance {
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

type BalanceByPortfolio = {
  [key in Portfolio]: {
    balance: Balance;
    total: number;
  };
};

export interface BalanceForSinglePortfolio {
  balance: Balance;
  total: number;
}

export interface BalanceWithTotal {
  balance: BalanceByPortfolio;
  total: number;
}
