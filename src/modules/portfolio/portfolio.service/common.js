import { buildLogger } from '../../../libs/logger';
import database from '../../../providers/database';
import fixedService from '../../fixed/fixed.service';
import stockService from '../../stock/stock.service';
import cryptoService from '../../crypto/crypto.service';

const log = buildLogger('Portfolios');

export const services = {
  fixed: fixedService,
  stock: stockService,
  crypto: cryptoService,
};

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
  // TODO change asset param to { class, name }
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

export const extractPortfolioNames = portfolioData => {
  const portfolios = new Set();

  portfolioData.forEach(asset =>
    asset.shares.forEach(({ portfolio }) => portfolios.add(portfolio))
  );

  return Array.from(portfolios);
};

export const swapOnAsset = async ({
  value,
  assetClass,
  assetName,
  origin,
  destiny,
}) => {
  const service = services[assetClass];
  const totalAssetValue = await service.getTotalPosition(assetName);

  const portfolioData = await getPortfolioData();

  const asset = portfolioData.find(
    item => item.assetClass === assetClass && item.assetName === assetName
  );

  let originPortfolio = asset.shares.find(
    ({ portfolio }) => portfolio === origin
  );
  if (!originPortfolio) {
    originPortfolio = { portfolio: origin, value: 0 };
    asset.shares.push(originPortfolio);
  }

  let destinyPortfolio = asset.shares.find(
    ({ portfolio }) => portfolio === destiny
  );
  if (!destinyPortfolio) {
    destinyPortfolio = { portfolio: destiny, value: 0 };
    asset.shares.push(destinyPortfolio);
  }

  const deltaShare = value / totalAssetValue;

  originPortfolio.value = originPortfolio.value - deltaShare;
  destinyPortfolio.value = destinyPortfolio.value + deltaShare;

  const hasOriginFunds = !isNegative(originPortfolio.value);
  const hasDestinyFinds = !isNegative(destinyPortfolio.value);

  if (!hasOriginFunds || !hasDestinyFinds) {
    if (!hasOriginFunds) {
      log(`Not enough funds on ${origin} (${assetClass}/${assetName})`, {
        severity: 'warn',
      });
    }

    if (!hasDestinyFinds) {
      log(`Not enough funds on ${destiny} (${assetClass}/${assetName})`, {
        severity: 'warn',
      });
    }

    return { status: 'notEnoughFunds' };
  }

  verifyShares(asset.shares.map(({ value }) => value));

  await database.updateOne(
    'portfolio',
    'shares',
    { assetClass, assetName },
    { $set: { shares: asset.shares } }
  );

  return { status: 'ok' };
};
