import database from '../../../providers/database';
import fixedService from '../../fixed/fixed.service';
import stockService from '../../stock/stock.service';
import cryptoService from '../../crypto/crypto.service';
import { getPortfolioData, verifyShares } from './common';

const services = {
  fixed: fixedService,
  stock: stockService,
  crypto: cryptoService,
};

const depositValueToAsset = async ({ assetClass, assetName, value }) => {
  const service = services[assetClass];
  await service.deposit({ asset: assetName, value });
};

const addValuesToPortfolioList = (shares, totalAssetValue) =>
  shares.map(({ portfolio, value }) => ({
    portfolio,
    share: value,
    value: value * totalAssetValue,
  }));

const addValueToPortfolioItem = (portfolioList, portfolioName, value) => {
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

export default async ({
  value,
  portfolio,
  assetClass,
  assetName,
  executed,
}) => {
  if (assetClass === 'stock') assetName = 'float';

  const service = services[assetClass];
  const totalAssetValue = await service.getTotalPosition(assetName);
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
    database.updateOne(
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
