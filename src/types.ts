import type { FixedAsset, StockAssetType } from './schemas';

export type Month =
  | 'jan'
  | 'feb'
  | 'mar'
  | 'apr'
  | 'may'
  | 'jun'
  | 'jul'
  | 'aug'
  | 'sep'
  | 'oct'
  | 'nov'
  | 'dec';

export type AssetClass = 'fixed' | 'stock' | 'crypto';

export type FixedAssetBalance = {
  asset: FixedAsset;
  liquidity?: boolean;
  value: number;
};

export type StockAssetBalance = {
  asset: StockAssetType;
  value: number;
};

/**
 * @deprecated Moved to schemas file for runtime schema validation
 */
export type CryptoAsset =
  | 'binanceBuffer'
  | 'hodl'
  | 'backed'
  | 'defi'
  | 'defi2';

export type CryptoAssetBalance = {
  asset: CryptoAsset;
  value: number;
};

export type AssetName = FixedAsset | StockAssetType | CryptoAsset;

/**
 * @deprecated Moved to schemas file for runtime schema validation
 */
export type Asset =
  | {
      class: 'fixed';
      name: FixedAsset;
    }
  | {
      class: 'stock';
      name: StockAssetType;
    }
  | {
      class: 'crypto';
      name: CryptoAsset;
    };

export type AssetBalance =
  | FixedAssetBalance
  | {
      asset: AssetName;
      liquidity?: boolean;
      value: number;
    };

/**
 * @deprecated Moved to schemas file for runtime schema validation
 */
export type Portfolio =
  | 'temp' // TODO for testing only, change tests to remove this one
  | 'reservaEmergencia'
  | 'amortecedor'
  | 'financiamento'
  | 'viagem'
  | 'reformaCasa'
  | 'previdencia'
  | 'leni'
  | 'mae'
  | 'seguroCarro'
  | 'impostos'
  | 'manutencaoCarro'
  | 'suricat'
  | 'congelamentoSuricats'
  | 'carro'
  | 'macbookFirma'
  | 'rendaPassiva';
