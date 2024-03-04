import { z } from 'zod';

export const currencySchema = z.number().multipleOf(0.01).min(1);

export const positiveCurrencySchema = z
  .number()
  .multipleOf(0.01)
  .positive()
  .min(1);

const FIXED_ASSET = [
  'nubank',
  'iti',
  '99pay',
  'inco',
  'xpWesternAsset',
  'xpTrendInvestback',
  'daycovalCDB110',
  'daycovalCDBCDI1_2',
  'nuInvestCDB8_5',
  'nuInvestCDB9_5',
  'nuInvestCDB12_5',
  'nuInvestCBDIPCA5_5',
  'nuInvestTDIPCA2035',
  'nuInvestTDPre2029',
  'nuInvestTDIPCA2045',
  'interArcaPGBL',
  'sofisaCDBMax60',
  'sofisaCDB110',
  'sofisaCDBIPCA7_5',
] as const;

export const fixedAssetSchema = z.enum(FIXED_ASSET);

export type FixedAsset = z.infer<typeof fixedAssetSchema>;

const fixedAssetClassSchema = z.object({
  class: z.literal('fixed'),
  name: fixedAssetSchema,
});

const STOCK_ASSET = ['float', 'br', 'us', 'fii'] as const;

// type StockAsset = (typeof STOCK_ASSET)[number];

const stockAssetClassSchema = z.object({
  class: z.literal('stock'),
  name: z.enum(STOCK_ASSET),
});

const CRYPTO_ASSET = [
  'binanceBuffer',
  'hodl',
  'backed',
  'defi',
  'defi2',
] as const;

// type CryptoAsset = (typeof CRYPTO_ASSET)[number];

const cryptoAssetClassSchema = z.object({
  class: z.literal('crypto'),
  name: z.enum(CRYPTO_ASSET),
});

export const assetSchema = z.union([
  fixedAssetClassSchema,
  stockAssetClassSchema,
  cryptoAssetClassSchema,
]);

export type Asset = z.infer<typeof assetSchema>;

const PORTFOLIO = [
  'reservaEmergencia',
  'amortecedor',
  'financiamento',
  'viagem',
  'reformaCasa',
  'previdencia',
  'leni',
  'mae',
  'seguroCarro',
  'impostos',
  'manutencaoCarro',
  'suricat',
  'congelamentoSuricats',
  'carro',
  'macbookFirma',
  'rendaPassiva',
] as const;

export const portfolioSchema = z.enum(PORTFOLIO);

export type Portfolio = z.infer<typeof portfolioSchema>;
