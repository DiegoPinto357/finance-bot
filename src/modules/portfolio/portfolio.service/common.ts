import { buildLogger } from '../../../libs/logger';
import database from '../../../providers/database';
import fixedService from '../../fixed/fixed.service';
import stockService from '../../stock/stock.service';
import cryptoService from '../../crypto/crypto.service';
import {
  AssetBalanceWithClass,
  BalanceByAsset,
  BalanceByAssetWithTotal,
  PortfolioData,
} from './types';
import { Asset, AssetClass, AssetName, Portfolio } from '../../../types';

const log = buildLogger('Portfolios');

export const services = {
  fixed: fixedService,
  stock: stockService,
  crypto: cryptoService,
};

const precision = 0.006;
export const isAround0 = (value: number) =>
  value >= 0 - precision && value <= 0 + precision;
export const isAround1 = (value: number) =>
  value >= 1 - precision && value <= 1 + precision;
export const isNegative = (value: number) => value < -precision;

export const verifyShares = (shares: number[]) => {
  const sum = shares.reduce((acc, current) => acc + current, 0);

  if (!isAround1(sum) && !isAround0(sum))
    throw new Error(`Sum of shares is not 1: current value ${sum}`);
};

export const getAssetValueFromBalance = (
  { balance }: BalanceByAssetWithTotal,
  // TODO change asset param to { class, name }
  assetClass: AssetClass,
  assetName: AssetName
) => {
  const classBalance = balance[assetClass];
  if (!classBalance) return 0;
  const assetItem = classBalance.balance.find(item => item.asset === assetName);
  return assetItem ? assetItem.value : 0;
};

export const hasFunds = (
  balance: BalanceByAssetWithTotal,
  asset: Asset,
  value: number
) => {
  const currentValue = getAssetValueFromBalance(
    balance,
    asset.class,
    asset.name
  );
  return currentValue - value >= 0;
};

export const getPortfolioData = (filter = {}) =>
  database.find<PortfolioData[]>('portfolio', 'shares', filter, {
    projection: { _id: 0 },
  });

export const extractPortfolioNames = (portfolioData: PortfolioData[]) => {
  const portfolios = new Set<Portfolio>();

  portfolioData.forEach(asset =>
    asset.shares.forEach(({ portfolio }) => portfolios.add(portfolio))
  );

  return Array.from(portfolios);
};

export const getAssetPosition = async (
  assetClass: AssetClass,
  assetName: AssetName
) => {
  const service = services[assetClass];
  // TODO try to infer this one
  type GetAssetPosition = (assetName: AssetName) => Promise<number>;
  return await (<GetAssetPosition>service.getAssetPosition)(assetName);
};

export const getPortfolioPositionOnAsset = async (
  portfolio: Portfolio,
  asset: Asset
) => {
  const totalAssetValue = await getAssetPosition(asset.class, asset.name);
  const portfolioData = await getPortfolioData({
    assetClass: asset.class,
    assetName: asset.name,
  });

  const currentShare = portfolioData[0].shares.find(
    share => share.portfolio === portfolio
  );

  if (!currentShare) {
    throw new Error(`Portfolio ${portfolio} not found.`);
  }

  return currentShare?.value * totalAssetValue;
};

export const swapOnAsset = async ({
  value,
  assetClass,
  assetName,
  origin,
  destiny,
}: {
  value: number;
  assetClass: AssetClass;
  assetName: AssetName;
  origin: Portfolio;
  destiny: Portfolio;
}) => {
  const totalAssetValue = await getAssetPosition(assetClass, assetName);

  const portfolioData = await getPortfolioData();

  const asset = portfolioData.find(
    item => item.assetClass === assetClass && item.assetName === assetName
  );

  if (!asset) {
    log(`Asset ${assetName} not found on ${assetClass}`, { severity: 'warn' });
    return { status: 'assetnotFound' };
  }

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

  await database.updateOne<PortfolioData>(
    'portfolio',
    'shares',
    { assetClass, assetName },
    { $set: { shares: asset.shares } },
    {}
  );

  return { status: 'ok' };
};

export const flatPortfolioBalance = (
  balance: BalanceByAsset
): AssetBalanceWithClass[] => [
  ...(balance.fixed?.balance || []).map(item => ({
    assetClass: <AssetClass>'fixed',
    ...item,
  })),
  ...(balance.stock?.balance || []).map(item => ({
    assetClass: <AssetClass>'stock',
    ...item,
  })),
  ...(balance.crypto?.balance || []).map(item => ({
    assetClass: <AssetClass>'crypto',
    ...item,
  })),
];
