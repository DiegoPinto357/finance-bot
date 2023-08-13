import fixedService from '../fixed/fixed.service';
import stockService from '../stock/stock.service';
import cryptoService from '../crypto/crypto.service';
import portfolioService from '../portfolio/portfolio.service';

export type Module = 'portfolio' | 'fixed' | 'stock' | 'crypto';

type PortfolioMethod = keyof typeof portfolioService;
type FixedMethod = keyof typeof fixedService;
type StockMethod = keyof typeof stockService;
type CryptoMethod = keyof typeof cryptoService;
export type Method = PortfolioMethod | FixedMethod | StockMethod | CryptoMethod;

type PortfolioAction =
  | PortfolioActions.Deposit
  | PortfolioActions.Transfer
  | PortfolioActions.Swap
  | PortfolioActions.Distribute
  | PortfolioActions.MoveToPortfolio
  | PortfolioActions.UpdateTables;

type Action = PortfolioAction;

export interface Script {
  enable: boolean;
  actions: Action[];
}

export namespace PortfolioActions {
  type DepositParams = Parameters<typeof portfolioService.deposit>[0];
  type TransferParams = Parameters<typeof portfolioService.transfer>[0];
  type SwapParams = Parameters<typeof portfolioService.swap>[0];
  type DistributeParams = Parameters<typeof portfolioService.distribute>[0];
  type MoveToPortfolioParams = Parameters<
    typeof portfolioService.moveToPortfolio
  >[0];

  export interface Deposit {
    skip?: boolean;
    module: 'portfolio';
    method: 'deposit';
    defaultParams?: Partial<DepositParams>;
    params?: Partial<DepositParams> | Partial<DepositParams>[];
  }

  export interface Transfer {
    skip?: boolean;
    module: 'portfolio';
    method: 'transfer';
    defaultParams?: Partial<TransferParams>;
    params?: Partial<TransferParams> | Partial<TransferParams>[];
  }

  export interface Swap {
    skip?: boolean;
    module: 'portfolio';
    method: 'swap';
    defaultParams?: Partial<SwapParams>;
    params?: Partial<SwapParams> | Partial<SwapParams>[];
  }

  export interface Distribute {
    skip?: boolean;
    module: 'portfolio';
    method: 'distribute';
    defaultParams?: Partial<DistributeParams>;
    params?: Partial<DistributeParams> | Partial<DistributeParams>[];
  }

  export interface MoveToPortfolio {
    skip?: boolean;
    module: 'portfolio';
    method: 'moveToPortfolio';
    defaultParams?: Partial<MoveToPortfolioParams>;
    params?: Partial<MoveToPortfolioParams> | Partial<MoveToPortfolioParams>[];
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
