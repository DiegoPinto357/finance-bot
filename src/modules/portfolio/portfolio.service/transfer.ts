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

  const { status: originDepositStatus } = await deposit({
    value: -transferValue,
    portfolio,
    assetClass: origin.class,
    assetName: origin.name,
  });

  if (originDepositStatus !== 'ok') return { status: originDepositStatus };

  const { status: destinyDepositStatus } = await deposit({
    value: transferValue,
    portfolio,
    assetClass: destiny.class,
    assetName: destiny.name,
  });

  if (destinyDepositStatus !== 'ok') return { status: destinyDepositStatus };

  return { status: 'ok' };
};
