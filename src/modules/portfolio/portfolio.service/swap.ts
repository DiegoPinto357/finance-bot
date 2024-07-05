import { z } from 'zod';
import { getPortfolioPositionOnAsset, swapOnAsset } from './common';
import {
  positiveCurrencySchema,
  portfolioSchema,
  assetSchema,
} from '../../../schemas';

import type { Asset, Portfolio } from '../../../schemas';

type SwapOnAssetParams = {
  assets: [Asset, Asset];
  originPortfolio: Portfolio;
  destinyPortfolio: Portfolio;
};

const swapOnPortfolioSchema = z.object({
  value: z.union([positiveCurrencySchema, z.literal('all')]),
  portfolio: portfolioSchema,
  origin: assetSchema,
  destiny: assetSchema,
  liquidity: portfolioSchema,
});

// TODO consider swap on asset (?)
// const swapOnAssetSchema = z.object({
//   value: z.union([positiveCurrencySchema, z.literal('all')]),
//   asset: assetSchema,
//   origin: portfolioSchema,
//   destiny: portfolioSchema,
//   liquidity: assetSchema,
// });

// export const swapSchema = z.union([swapOnPortfolioSchema, swapOnAssetSchema]);
export const swapSchema = swapOnPortfolioSchema;

export default async (swapParams: z.infer<typeof swapSchema>) => {
  const withinSamePortfolio = 'portfolio' in swapParams;

  const params: Partial<SwapOnAssetParams> = {};

  if (withinSamePortfolio) {
    // portfolio is constant
    // another portfolio is the liquidity
    // different assets are the origin and destiny
    const { origin, destiny, portfolio, liquidity } = swapParams;
    params.assets = [origin, destiny];
    params.originPortfolio = portfolio;
    params.destinyPortfolio = liquidity;
  } else {
    // withinSameAsset
    // asset is constant
    // another asset is the liquidity
    // different portfolios are the origin and destiny
    const { asset, liquidity, origin, destiny } = swapParams;
    params.assets = [asset, liquidity];
    params.originPortfolio = origin;
    params.destinyPortfolio = destiny;
  }

  const [originCurrentValue, liquidityCurrentValue] = await Promise.all([
    getPortfolioPositionOnAsset(params.originPortfolio, params.assets[0]),
    getPortfolioPositionOnAsset(params.destinyPortfolio, params.assets[1]),
  ]);

  const { value } = swapParams;

  const swapValue = value === 'all' ? originCurrentValue : value;

  const hasOriginFunds = originCurrentValue >= swapValue;
  const hasLiquidityFunds = liquidityCurrentValue >= swapValue;

  if (!hasOriginFunds || !hasLiquidityFunds) {
    return { status: 'notEnoughFunds' };
  }

  await Promise.all([
    await swapOnAsset({
      value: swapValue,
      assetClass: params.assets[0].class,
      assetName: params.assets[0].name,
      origin: params.originPortfolio,
      destiny: params.destinyPortfolio,
    }),
    await swapOnAsset({
      value: -swapValue,
      assetClass: params.assets[1].class,
      assetName: params.assets[1].name,
      origin: params.originPortfolio,
      destiny: params.destinyPortfolio,
    }),
  ]);

  return { status: 'ok' };
};
