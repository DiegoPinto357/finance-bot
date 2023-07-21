import getBalance from './getBalance';
import { getAssetValueFromBalance, hasFunds, swapOnAsset } from './common';

export default async ({
  value,
  portfolio,
  asset,
  origin,
  destiny,
  liquidity,
}) => {
  const withinSamePortfolio = portfolio && !asset;

  const params = {};

  if (withinSamePortfolio) {
    // portfolio is constant
    // another portfolio is the liquidity
    // different assets are the origin and destiny
    params.assets = [origin, destiny];
    params.originPortfolio = portfolio;
    params.destinyPortfolio = liquidity;
  } else {
    // withinSameAsset
    // asset is constant
    // another asset is the liquidity
    // different portfolios are the origin and destiny
    params.assets = [asset, liquidity];
    params.originPortfolio = origin;
    params.destinyPortfolio = destiny;
  }

  // TODO get balances in a single call
  const [originBalance, liquidityBalance] = await Promise.all([
    getBalance(params.originPortfolio),
    getBalance(params.destinyPortfolio),
  ]);

  const swapValue =
    value === 'all'
      ? getAssetValueFromBalance(
          originBalance,
          params.assets[0].class,
          params.assets[0].name
        )
      : value;

  const hasOriginFunds = hasFunds(originBalance, params.assets[0], swapValue);
  const hasLiquidityFunds = hasFunds(
    liquidityBalance,
    params.assets[1],
    swapValue
  );

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
