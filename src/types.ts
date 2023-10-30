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

export type FixedAsset =
  | 'nubank'
  | 'iti'
  | '99pay'
  | 'inco'
  | 'xpWesternAsset'
  | 'xpTrendInvestback'
  | 'daycovalCDB110'
  | 'daycovalCDBCDI1_2'
  | 'nuInvestCDB8_5'
  | 'nuInvestCDB9_5'
  | 'nuInvestCDB12_5'
  | 'nuInvestCBDIPCA5_5'
  | 'nuInvestTDIPCA2035'
  | 'nuInvestTDPre2029'
  | 'nuInvestTDIPCA2045'
  | 'interArcaPGBL'
  | 'sofisaCDBMax60'
  | 'sofisaCDB110'
  | 'sofisaCDBIPCA7_5';

export type FixedAssetBalance = {
  asset: FixedAsset;
  liquidity?: boolean;
  value: number;
};

export type StockAsset = 'float' | 'br' | 'us' | 'fii';

export type StockAssetBalance = {
  asset: StockAsset;
  value: number;
};

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

export type AssetName = FixedAsset | StockAsset | CryptoAsset;

export type Asset =
  | {
      class: 'fixed';
      name: FixedAsset;
    }
  | {
      class: 'stock';
      name: StockAsset;
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
