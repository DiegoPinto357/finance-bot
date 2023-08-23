import { getPortfolioPositionOnAsset, swapOnAsset } from './common';
import { Asset, Portfolio } from '../../../types';

export interface MoveToPortfolioParams {
  value: number | 'all';
  asset: Asset;
  origin: Portfolio;
  destiny: Portfolio;
}

interface MoveToPortfolioResult {
  status: 'ok' | 'notEnoughFunds';
}

export default async ({
  value,
  asset,
  origin,
  destiny,
}: MoveToPortfolioParams): Promise<MoveToPortfolioResult> => {
  const transferValue =
    value === 'all' ? await getPortfolioPositionOnAsset(origin, asset) : value;

  return (await swapOnAsset({
    value: transferValue,
    assetClass: asset.class,
    assetName: asset.name,
    origin,
    destiny,
  })) as MoveToPortfolioResult;
};
