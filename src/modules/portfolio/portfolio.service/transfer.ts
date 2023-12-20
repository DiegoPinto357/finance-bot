import deposit from './deposit';
import { getPortfolioPositionOnAsset } from './common';
import { Asset, Portfolio } from '../../../types';

interface TransferParams {
  value: number | 'all';
  portfolio: Portfolio;
  origin: Asset;
  destiny: Asset;
}

export default async ({
  value,
  portfolio,
  origin,
  destiny,
}: TransferParams) => {
  const currentOriginValue = await getPortfolioPositionOnAsset(
    portfolio,
    origin
  );

  const transferValue = value === 'all' ? currentOriginValue : value;
  const hasOriginFunds = currentOriginValue >= transferValue;

  if (!hasOriginFunds) {
    // FIXME throw error
    return { status: 'notEnoughFunds' };
  }

  await deposit({
    value: -transferValue,
    portfolio,
    assetClass: origin.class,
    assetName: origin.name,
  });
  await deposit({
    value: transferValue,
    portfolio,
    assetClass: destiny.class,
    assetName: destiny.name,
  });

  return { status: 'ok' };
};
