import getBalance from './getBalance';
import deposit from './deposit';
import { getAssetValueFromBalance, hasFunds } from './common';

export default async ({
  value,
  portfolio,
  origin,
  destiny,
  originExecuted,
  destinyExecuted,
}) => {
  const originBalance = await getBalance(portfolio);

  const transferValue =
    value === 'all'
      ? getAssetValueFromBalance(originBalance, origin.class, origin.name)
      : value;
  const hasOriginFunds = hasFunds(originBalance, origin, transferValue);

  if (!hasOriginFunds) {
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
