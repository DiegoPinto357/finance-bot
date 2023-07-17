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
  | 'sofisaCDB110';

export type StockAsset = 'float' | 'br' | 'us' | 'fii';

export type CryptoAsset = 'float' | 'hodl' | 'backed' | 'defi' | 'defi2';

export type AssetName = FixedAsset | StockAsset | CryptoAsset;

export interface Asset {
  class: AssetClass;
  name: AssetName;
}

export type Portfolio =
  | 'reservaEmergencia'
  | 'amortecedor'
  | 'financiamento'
  | 'viagem'
  | 'reformaCasa'
  | 'previdencia'
  | 'mae'
  | 'seguroCarro'
  | 'impostos'
  | 'manutencaoCarro'
  | 'suricat'
  | 'congelamentoSuricats'
  | 'carro'
  | 'macbookFirma';
