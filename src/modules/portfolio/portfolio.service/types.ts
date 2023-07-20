import { AssetClass, AssetName, Portfolio } from '../../../types';

export interface AssetBalance {
  asset: AssetName;
  liquidity?: boolean;
  value: number;
}

export type AssetBalanceWithClass = AssetBalance & {
  assetClass: AssetClass;
};

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

export interface ShareItem {
  portfolio: Portfolio;
  value: number;
}

export interface PortfolioData {
  assetClass: AssetClass;
  assetName: AssetName;
  shares: ShareItem[];
}
