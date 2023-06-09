import database from '../../../providers/database';

const precision = 0.006;
export const isAround0 = value =>
  value >= 0 - precision && value <= 0 + precision;
export const isAround1 = value =>
  value >= 1 - precision && value <= 1 + precision;
export const isNegative = value => value < -precision;

export const verifyShares = shares => {
  const sum = shares.reduce((acc, current) => acc + current, 0);

  if (!isAround1(sum) && !isAround0(sum))
    throw new Error(`Sum of shares is not 1: current value ${sum}`);
};

export const getAssetValueFromBalance = (
  { balance },
  assetClass,
  assetName
) => {
  const assetItem = balance[assetClass].balance.find(
    item => item.asset === assetName
  );
  return assetItem ? assetItem.value : 0;
};

export const hasFunds = (balance, asset, value) => {
  const currentValue = getAssetValueFromBalance(
    balance,
    asset.class,
    asset.name
  );
  return currentValue - value >= 0;
};

export const getPortfolioData = (filter = {}) =>
  database.find('portfolio', 'shares', filter, { projection: { _id: 0 } });
