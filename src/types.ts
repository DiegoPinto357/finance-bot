type AssetClass = 'fixed' | 'stock' | 'crypto';

type FixedAssets = 'nubank' | 'iti' | 'inco';

type StockAssets = 'float' | 'br' | 'us' | 'fii';

type CryptoAssets = 'float' | 'hodl' | 'backed' | 'defi' | 'defi2';

export interface Asset {
  class: AssetClass;
  name: FixedAssets | StockAssets | CryptoAssets;
}

export type Portfolio =
  | 'reservaEmergencia'
  | 'amortecedor'
  | 'financiamento'
  | 'viagem'
  | 'reformaCasa'
  | 'previdencia';
