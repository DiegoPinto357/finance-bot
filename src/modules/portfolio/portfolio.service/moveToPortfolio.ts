import { getAssetValueFromBalance, swapOnAsset } from './common';
import getBalance from './getBalance';
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
  let transferValue: number;

  if (value === 'all') {
    const originBalance = await getBalance(origin);
    transferValue = getAssetValueFromBalance(
      originBalance,
      asset.class,
      asset.name
    );
  } else {
    transferValue = value;
  }

  return (await swapOnAsset({
    value: transferValue,
    assetClass: asset.class,
    assetName: asset.name,
    origin,
    destiny,
  })) as MoveToPortfolioResult;
};
