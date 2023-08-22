import { getPortfolioPositionOnAsset, swapOnAsset } from './common';
import { Asset, Portfolio } from '../../../types';

interface SwapOnAssetParams {
  assets: [Asset, Asset];
  originPortfolio: Portfolio;
  destinyPortfolio: Portfolio;
}

interface SwapOnPortfolio {
  value: number | 'all';
  portfolio: Portfolio;
  origin: Asset;
  destiny: Asset;
  liquidity: Portfolio;
}

interface SwapOnAsset {
  value: number | 'all';
  asset: Asset;
  origin: Portfolio;
  destiny: Portfolio;
  liquidity: Asset;
}

type SwapParams = SwapOnPortfolio | SwapOnAsset;

export default async (swapParams: SwapParams) => {
  // const withinSamePortfolio = portfolio && !asset;
  const withinSamePortfolio = 'portfolio' in swapParams;

  const params = {} as SwapOnAssetParams;

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
