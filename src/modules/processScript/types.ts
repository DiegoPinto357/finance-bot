import { Month, Portfolio, AssetClass, AssetName, Asset } from '../../types';

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
    defaulParams?: Partial<MoveToPortfolioParams>;
    params?: Partial<MoveToPortfolioParams>;
  }

  export interface UpdateTables {
    skip?: boolean;
    module: 'portfolio';
    method: 'updateTables';
  }
}
