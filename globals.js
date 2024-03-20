const AssetClasses = {
  FIXED: 'fixed',
  STOCK: 'stock',
  CRYPTO: 'crypto',
};

const FixedAssets = {
  NUBANK: 'nubank',
  ITI: 'iti',
  PAY99: '99pay',
  INCO: 'inco',
  XP_WESTERN_ASSET: 'xpWesternAsset',
  XP_TREND_INVESTBACK: 'xpTrendInvestback',
  DAYCOVAL_CDB_110: 'daycovalCDB110',
  DAYCOVAL_CDB_CDI_1_2: 'daycovalCDBCDI1_2',
  NUINVEST_CDB_8_5: 'nuInvestCDB8_5',
  NUINVEST_CDB_9_5: 'nuInvestCDB9_5',
  NUINVEST_CDB_12_5: 'nuInvestCDB12_5',
  NUINVEST_CDB_IPCA_5_5: 'nuInvestCBDIPCA5_5',
  NUINVEST_TD_IPCA_2035: 'nuInvestTDIPCA2035',
  NUINVEST_TD_PRE_2029: 'nuInvestTDPre2029',
  NUINVEST_TD_IPCA_2045: 'nuInvestTDIPCA2045',
  INTER_ARCA_PGBL: 'interArcaPGBL',
  SOFISA_CDB_MAX60: 'sofisaCDBMax60',
  SOFISA_CDB_110: 'sofisaCDB110',
  SOFISA_CDB_IPCA_7_5: 'sofisaCDBIPCA7_5',
};

const StockPortfolioType = {
  BR: 'br',
  US: 'us',
  FII: 'fii',
};

const StockAssets = {
  BR: {
    ARZZ3: 'ARZZ3',
    B3SA3: 'B3SA3',
    BBSE3: 'BBSE3',
    CRPG5: 'CRPG5',
    EGIE3: 'EGIE3',
    ENBR3: 'ENBR3',
    EZTC3: 'EZTC3',
    FLRY3: 'FLRY3',
    INBR32: 'INBR32',
    ITSA3: 'ITSA3',
    ITUB3: 'ITUB3',
    MDIA3: 'MDIA3',
    MRVE3: 'MRVE3',
    ROMI3: 'ROMI3',
    SQIA3: 'SQIA3',
    WEGE3: 'WEGE3',
    WIZC3: 'WIZC3',
  },
  US: {
    IVVB11: 'IVVB11',
    NASD11: 'NASD11',
  },
  FII: {
    ALZR11: 'ALZR11',
    BCFF11: 'BCFF11',
    CPTS11: 'CPTS11',
    HGLG11: 'HGLG11',
    KNRI11: 'KNRI11',
    MXRF11: 'MXRF11',
    VISC11: 'VISC11',
    XPLG11: 'XPLG11',
  },
};

const CryptoAssets = {
  HODL: 'hodl',
  BACKED: 'backed',
};

const Portfolios = {
  RESERVA_EMERGENCIA: 'reservaEmergencia',
  AMORTECEDOR: 'amortecedor',
  FINANCIAMENTO: 'financiamento',
  VIAGEM: 'viagem',
  REFORMA_CASA: 'reformaCasa',
  PREVIDENCIA: 'previdencia',
  LENI: 'leni',
  MAE: 'mae',
  SEGURO_CARRO: 'seguroCarro',
  IMPOSTOS: 'impostos',
  MANUTENCAO_CARRO: 'manutencaoCarro',
  SURICAT: 'suricat',
  CONGELAMENTO_SURICATS: 'congelamentoSuricats',
  CARRO: 'carro',
  MACBOOK_FIRMA: 'macbookFirma',
};

global.AssetClasses = AssetClasses;
global.FixedAssets = FixedAssets;
global.StockPortfolioType = StockPortfolioType;
global.StockAssets = StockAssets;
global.CryptoAssets = CryptoAssets;
global.Portfolios = Portfolios;
