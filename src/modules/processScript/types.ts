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

type FixedAction = FixedActions.SetAssetValue;

type StockAction = StockActions.Buy | StockActions.SetAssetValue;

type CryptoAction = CryptoActions.Sell;

type PortfolioAction =
  | PortfolioActions.Deposit
  | PortfolioActions.Transfer
  | PortfolioActions.Swap
  | PortfolioActions.Distribute
  | PortfolioActions.MoveToPortfolio
  | PortfolioActions.UpdateTables;

type Action = FixedAction | StockAction | CryptoAction | PortfolioAction;

export type Script = {
  enable: boolean;
  actions: Action[];
};

export namespace FixedActions {
  type SetAssetValueParams = Parameters<typeof fixedService.setAssetValue>[0];

  type Base = {
    skip?: boolean;
    module: 'fixed';
  };

  export type SetAssetValue = Base & {
    method: 'setAssetValue';
    defaultParams?: Partial<SetAssetValueParams>;
    params?: Partial<SetAssetValueParams> | Partial<SetAssetValueParams>[];
  };
}

export namespace StockActions {
  type BuyParams = Parameters<typeof stockService.buy>[0];
  type SetAssetValueParams = Parameters<typeof stockService.setAssetValue>[0];

  type Base = {
    skip?: boolean;
    module: 'stock';
  };

  export type Buy = Base & {
    method: 'buy';
    defaultParams?: Partial<BuyParams>;
    params?: Partial<BuyParams> | Partial<BuyParams>[];
  };

  export type SetAssetValue = Base & {
    method: 'setAssetValue';
    defaultParams?: Partial<SetAssetValueParams>;
    params?: Partial<SetAssetValueParams> | Partial<SetAssetValueParams>[];
  };
}

export namespace CryptoActions {
  type SellParams = Parameters<typeof cryptoService.sell>[0];

  type Base = {
    skip?: boolean;
    module: 'crypto';
  };

  export type Sell = Base & {
    method: 'sell';
    defaultParams?: Partial<SellParams>;
    params?: Partial<SellParams> | Partial<SellParams>[];
  };
}

export namespace PortfolioActions {
  type DepositParams = Parameters<typeof portfolioService.deposit>[0];
  type TransferParams = Parameters<typeof portfolioService.transfer>[0];
  type SwapParams = Parameters<typeof portfolioService.swap>[0];
  type DistributeParams = Parameters<typeof portfolioService.distribute>[0];
  type MoveToPortfolioParams = Parameters<
    typeof portfolioService.moveToPortfolio
  >[0];

  type Base = {
    skip?: boolean;
    module: 'portfolio';
  };

  export type Deposit = Base & {
    method: 'deposit';
    defaultParams?: Partial<DepositParams>;
    params?: Partial<DepositParams> | Partial<DepositParams>[];
  };

  export type Transfer = Base & {
    method: 'transfer';
    defaultParams?: Partial<TransferParams>;
    params?: Partial<TransferParams> | Partial<TransferParams>[];
  };

  export type Swap = Base & {
    method: 'swap';
    defaultParams?: Partial<SwapParams>;
    params?: Partial<SwapParams> | Partial<SwapParams>[];
  };

  export type Distribute = Base & {
    method: 'distribute';
    defaultParams?: Partial<DistributeParams>;
    params?: Partial<DistributeParams> | Partial<DistributeParams>[];
  };

  export type MoveToPortfolio = Base & {
    method: 'moveToPortfolio';
    defaultParams?: Partial<MoveToPortfolioParams>;
    params?: Partial<MoveToPortfolioParams> | Partial<MoveToPortfolioParams>[];
  };

  export type UpdateTables = Base & {
    method: 'updateTables';
    // TODO check if this is ok
    defaultParams?: never;
    params?: never;
  };
}
