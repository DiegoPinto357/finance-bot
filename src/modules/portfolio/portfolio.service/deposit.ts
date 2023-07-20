import database from '../../../providers/database';
import fixedService from '../../fixed/fixed.service';
import stockService from '../../stock/stock.service';
import cryptoService from '../../crypto/crypto.service';
import { getPortfolioData, verifyShares } from './common';
import { ShareItem, PortfolioData } from './types';
import { AssetClass, AssetName, Portfolio } from '../../../types';

interface ShareItemWithValue {
  portfolio: Portfolio;
  share: number;
  value: number;
}

const services = {
  fixed: fixedService,
  stock: stockService,
  crypto: cryptoService,
};

interface DepositValueToAssetParams {
  assetClass: AssetClass;
  assetName: AssetName;
  value: number;
}

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

interface DepositParams {
  value: number;
  portfolio: Portfolio;
  assetClass: AssetClass;
  assetName: AssetName;
  executed: boolean;
}

export default async ({
  value,
  portfolio,
  assetClass,
  assetName,
  executed,
}: DepositParams) => {
  if (assetClass === 'stock') assetName = 'float';

  const service = services[assetClass];
  // TODO try to infer this one
  type GetAssetPosition = (assetName: AssetName) => Promise<number>;
  const totalAssetValue = await (<GetAssetPosition>service.getAssetPosition)(
    assetName
  );
  const currentTotalAssetValue = executed
    ? totalAssetValue - value
    : totalAssetValue;
  const newTotalAssetValue = currentTotalAssetValue + value;

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

  const newShares = portfolioList.map(item => ({
    portfolio: item.portfolio,
    value: newTotalAssetValue !== 0 ? item.value / newTotalAssetValue : 0,
  }));

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
