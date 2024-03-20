import database from '../../../providers/database';
import fixedService from '../../fixed/fixed.service';
import stockService from '../../stock/stock.service';
import cryptoService from '../../crypto/crypto.service';
import {
  getPortfolioData,
  verifyShares,
  getAssetPosition,
  isAround0,
} from './common';

import type { ShareItem, PortfolioData } from './types';
import type { AssetClass, AssetName, Portfolio } from '../../../types';

const CryptoAutoBalanceFetch = ['hodl', 'defi', 'defi2', 'backed'];

const services = {
  fixed: fixedService,
  stock: stockService,
  crypto: cryptoService,
};

type ShareItemWithValue = {
  portfolio: Portfolio;
  share: number;
  value: number;
};

type DepositValueToAssetParams = {
  assetClass: AssetClass;
  assetName: AssetName;
  value: number;
};

const depositValueToAsset = async ({
  assetClass,
  assetName,
  value,
}: DepositValueToAssetParams) => {
  const service = services[assetClass];
  // TODO try to infer this one
  interface ServiceDepositParams {
    asset: AssetName;
    value: number;
  }
  type Deposit = ({
    asset,
    value,
  }: ServiceDepositParams) => Promise<{ status: string }>;
  await (<Deposit>service.deposit)({
    asset: assetName,
    value,
  });
};

const addValuesToPortfolioList = (
  shares: ShareItem[],
  totalAssetValue: number
): ShareItemWithValue[] =>
  shares.map(({ portfolio, value }) => ({
    portfolio,
    share: value,
    value: value * totalAssetValue,
  }));

const addValueToPortfolioItem = (
  portfolioList: ShareItemWithValue[],
  portfolioName: Portfolio,
  value: number
) => {
  let portfolioItem = portfolioList.find(
    item => item.portfolio === portfolioName
  );

  if (!portfolioItem) {
    portfolioItem = { portfolio: portfolioName, share: 1, value };
    portfolioList.push(portfolioItem);
  } else {
    portfolioItem.value = portfolioItem.value + value;
  }

  if (portfolioItem.value < 0) {
    return { status: 'notEnoughFunds' };
  }

  return { status: 'ok' };
};

type DepositParams = {
  value: number;
  portfolio: Portfolio;
  assetClass: AssetClass;
  assetName: AssetName;
};

export default async ({
  value,
  portfolio,
  assetClass,
  assetName,
}: DepositParams) => {
  if (assetClass === 'stock') assetName = 'float';

  const totalAssetValue = await getAssetPosition(assetClass, assetName);

  const executed =
    assetClass === 'crypto' && CryptoAutoBalanceFetch.includes(assetName);

  const currentTotalAssetValue = executed
    ? totalAssetValue - value
    : totalAssetValue;
  const newTotalAssetValue = currentTotalAssetValue + value;
  const newTotalAssetValueAdjusted = isAround0(newTotalAssetValue)
    ? 0
    : newTotalAssetValue;

  const portfolioData = await getPortfolioData({ assetClass, assetName });

  const asset = portfolioData.length
    ? portfolioData[0]
    : { assetClass, assetName, shares: [] };

  const portfolioList = addValuesToPortfolioList(
    asset.shares,
    currentTotalAssetValue
  );

  // FIXME do not mutate portfolioList
  const { status: addValueStatus } = addValueToPortfolioItem(
    portfolioList,
    portfolio,
    value
  );

  if (addValueStatus !== 'ok') {
    return { status: addValueStatus };
  }

  const newShares = portfolioList.map(item => {
    const itemValue = isAround0(item.value) ? 0 : item.value;
    const value =
      newTotalAssetValueAdjusted !== 0
        ? itemValue / newTotalAssetValueAdjusted
        : 0;
    return {
      portfolio: item.portfolio,
      value,
    };
  });

  verifyShares(newShares.map(({ value }) => value));

  await Promise.all([
    database.updateOne<PortfolioData>(
      'portfolio',
      'shares',
      { assetClass, assetName },
      { $setOnInsert: { assetClass, assetName }, $set: { shares: newShares } },
      { upsert: true }
    ),
    depositValueToAsset({
      assetClass,
      assetName,
      value,
    }),
  ]);

  return { status: 'ok' };
};
