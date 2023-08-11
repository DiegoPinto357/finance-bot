import fixedService from '../fixed/fixed.service';
import stockService from '../stock/stock.service';
import cryptoService from '../crypto/crypto.service';
import portfolioService from '../portfolio/portfolio.service';
import { Month, Portfolio, AssetClass, AssetName, Asset } from '../../types';

export type Module = 'portfolio' | 'fixed' | 'stock' | 'crypto';

type PortfolioMethod = keyof typeof portfolioService;
type FixedMethod = keyof typeof fixedService;
type StockMethod = keyof typeof stockService;
type CryptoMethod = keyof typeof cryptoService;
export type Method = PortfolioMethod | FixedMethod | StockMethod | CryptoMethod;

type PortfolioAction =
  | PortfolioActions.Deposit
  | PortfolioActions.Distribute
  | PortfolioActions.MoveToPortfolio
  | PortfolioActions.UpdateTables;

type Action = PortfolioAction;

export interface Script {
  enable: boolean;
  actions: Action[];
}

export namespace PortfolioActions {
  interface DepositParams {
    assetClass: AssetClass;
    assetName: AssetName;
    portfolio: Portfolio;
    value: number;
  }

  interface DistributeParams {
    month: Month;
    asset: AssetName;
  }

  interface MoveToPortfolioParams {
    value: number | 'all';
    asset: Asset;
    origin: Portfolio;
    destiny: Portfolio;
  }

  export interface Deposit {
    skip?: boolean;
    module: 'portfolio';
    method: 'deposit';
    defaultParams?: Partial<DepositParams>;
    params?: Partial<DepositParams>[];
  }

  export interface Distribute {
    skip?: boolean;
    module: 'portfolio';
    method: 'distribute';
    defaultParams?: Partial<DistributeParams>;
    params?: Partial<DistributeParams>;
  }

  export interface MoveToPortfolio {
    skip?: boolean;
    module: 'portfolio';
    method: 'moveToPortfolio';
    defaultParams?: Partial<MoveToPortfolioParams>;
    params?: Partial<MoveToPortfolioParams>;
  }

  export interface UpdateTables {
    skip?: boolean;
    module: 'portfolio';
    method: 'updateTables';
    // TODO check if this is ok
    defaultParams?: never;
    params?: never;
  }
}
