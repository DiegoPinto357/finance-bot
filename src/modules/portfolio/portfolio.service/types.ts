import type {
  AssetClass,
  AssetName,
  AssetBalance,
  FixedAssetBalance,
  StockAssetBalance,
  CryptoAssetBalance,
} from '../../../types';
import type { Portfolio } from '../../../schemas';

export type AssetBalanceWithClass = AssetBalance & {
  assetClass: AssetClass;
};

export type BalanceByAsset = {
  fixed?: {
    balance: FixedAssetBalance[];
    total: number;
  };
  stock?: {
    balance: StockAssetBalance[];
    total: number;
  };
  crypto?: {
    balance: CryptoAssetBalance[];
    total: number;
  };
};

export type BalanceByAssetWithTotal = {
  balance: BalanceByAsset;
  total: number;
};

export type BalanceByPortfolio = Record<Portfolio, BalanceByAssetWithTotal>;

export type BalanceByPortfolioWithTotal = {
  balance: BalanceByPortfolio;
  total: number;
};

export type ShareItem = {
  portfolio: Portfolio;
  value: number;
};

export type PortfolioData = {
  assetClass: AssetClass;
  assetName: AssetName;
  shares: ShareItem[];
};

export type PortfolioHistoryEntry = {
  date: string;
  portfolios: Record<Portfolio, number>;
};
