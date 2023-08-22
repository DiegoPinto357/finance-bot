import deposit from './deposit';
import { getAssetPosition, getPortfolioData } from './common';
import { Asset, Portfolio } from '../../../types';

interface TransferParams {
  value: number | 'all';
  portfolio: Portfolio;
  origin: Asset;
  destiny: Asset;
  originExecuted?: boolean;
  destinyExecuted?: boolean;
}

export default async ({
  value,
  portfolio,
  origin,
  destiny,
  originExecuted,
  destinyExecuted,
}: TransferParams) => {
  const totalAssetValue = await getAssetPosition(origin.class, origin.name);
  const portfolioData = await getPortfolioData({
    assetClass: origin.class,
    assetName: origin.name,
  });

  // TODO candidate to common method
  const currentShare = portfolioData[0].shares.find(
    share => share.portfolio === portfolio
  );

  if (!currentShare) {
    throw new Error(`Portfolio ${portfolio} not found.`);
  }

  const currentOriginValue = currentShare?.value * totalAssetValue;

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
    executed: originExecuted,
  });
  await deposit({
    value: transferValue,
    portfolio,
    assetClass: destiny.class,
    assetName: destiny.name,
    executed: destinyExecuted,
  });

  return { status: 'ok' };
};
