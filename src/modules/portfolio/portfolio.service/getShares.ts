import googleSheets from '../../../providers/googleSheets';
import { isAround1 } from './common';
import getBalance from './getBalance';
import getPortfolios from './getPortfolios';
import { flatPortfolioBalance } from './common';

import type { AssetName, AssetClass } from '../../../types';
import type { Portfolio } from '../../../schemas';
import type { AssetBalanceWithClass } from './types';

type GroupedBalance = Omit<AssetBalanceWithClass, 'asset'> & {
  asset?: AssetName;
};

type TargetShare = {
  assetClass: AssetClass;
  asset: AssetName;
  targetShare: number;
};

type TargetShareWithValue = {
  assetClass: AssetClass;
  asset?: AssetName;
  targetShare: number;
  value: number;
};

const getShareValues = (
  portfolioTargetShares: TargetShare[],
  balanceFlat: AssetBalanceWithClass[]
): TargetShareWithValue[] => {
  const targetShares = portfolioTargetShares.map(({ asset, ...entries }) => ({
    ...entries,
    asset: <unknown>asset !== '' ? asset : undefined,
  }));

  const targetClassGroups = targetShares
    .filter(({ asset }) => asset === undefined)
    .map(({ assetClass }) => assetClass);

  const assetList = [
    ...targetShares.map(({ assetClass, asset }) => ({
      assetClass,
      asset,
    })),
    ...balanceFlat
      .map(({ assetClass, asset }) => ({ assetClass, asset }))
      .filter(({ assetClass }) => !targetClassGroups.includes(assetClass)),
  ].filter(
    (item, index, list) =>
      index ===
      list.findIndex(
        t => t.assetClass === item.assetClass && t.asset === item.asset
      )
  );

  const groupedBalance = balanceFlat.reduce((grouped, balanceItem) => {
    if (targetClassGroups.includes(balanceItem.assetClass)) {
      const existingItem = grouped.find(
        ({ assetClass }) => balanceItem.assetClass === assetClass
      );
      if (existingItem) {
        existingItem.value = existingItem.value + balanceItem.value;
        return grouped;
      }
      return [...grouped, { ...balanceItem, asset: undefined }];
    }
    return [...grouped, balanceItem];
  }, [] as GroupedBalance[]);

  return assetList.reduce((result, assetItem) => {
    const targetShareItem = targetShares.find(
      ({ assetClass, asset }) =>
        assetItem.assetClass === assetClass &&
        (assetItem.asset === asset || asset === undefined)
    );

    const balanceItem = groupedBalance.find(
      ({ assetClass, asset }) =>
        assetItem.assetClass === assetClass &&
        (assetItem.asset === asset || asset === undefined)
    );

    if (!targetShareItem) {
      if (!balanceItem) {
        return [];
      }

      return [
        ...result,
        { ...balanceItem, targetShare: 0, liquidity: undefined },
      ];
    }

    if (!balanceItem) {
      if (!targetShareItem) {
        return [];
      }

      return [...result, { ...targetShareItem, value: 0 }];
    }

    return [...result, { ...targetShareItem, value: balanceItem.value }];
  }, [] as TargetShareWithValue[]);
};

const getActualShares = (
  targetSharesWithValues: TargetShareWithValue[],
  totalBalance: number
) => {
  const totalTargetShare = targetSharesWithValues.reduce(
    (total, { targetShare }) => total + targetShare,
    0
  );

  const isTargetSharesAvailable = isAround1(totalTargetShare);

  return targetSharesWithValues
    .map(share => {
      const currentShare = share.value / totalBalance;
      const diffBRL = isTargetSharesAvailable
        ? share.targetShare * totalBalance - share.value
        : 0;

      return { ...share, currentShare, diffBRL };
    })
    .sort((a, b) =>
      isTargetSharesAvailable ? b.diffBRL - a.diffBRL : a.value - b.value
    );
};

type Share = {
  currentShare: number;
  diffBRL: number;
  assetClass: AssetClass;
  asset?: AssetName;
  targetShare: number;
  value: number;
};

type SharesWithTotal = {
  shares: Share[];
  total: number;
};

type ShareByPortfolio = {
  portfolio: Portfolio;
  shares: Share[];
};

type SharesByPortfolioWithTotal = {
  shares: ShareByPortfolio[];
  total: number;
};

function getShares(): Promise<SharesByPortfolioWithTotal>;
function getShares(portfolioName?: Portfolio): Promise<SharesWithTotal>;
async function getShares(portfolioName?: Portfolio) {
  if (portfolioName) {
    const sharesSheetTitle = `portfolio-${portfolioName}-shares`;
    const [{ balance, total }, portfoliotTargetShares] = await Promise.all([
      getBalance(portfolioName),
      googleSheets.loadSheet<TargetShare[]>(sharesSheetTitle),
    ]);

    const balanceFlat = flatPortfolioBalance(balance);
    const targetSharesWithValues = getShareValues(
      portfoliotTargetShares,
      balanceFlat
    );
    const shares = getActualShares(targetSharesWithValues, total);

    return { shares, total };
  }

  const totalBalance = await getBalance();
  const totalBalanceFlat = Object.entries(totalBalance.balance).map(
    ([key, value]) => ({
      portfolio: key as Portfolio,
      balance: flatPortfolioBalance(value.balance),
    })
  );

  // TODO remove type cast as getPortfolios type is defined
  const portfolios = await getPortfolios();
  const shares = await Promise.all(
    portfolios.map(async portfolio => {
      const sharesSheetTitle = `portfolio-${portfolio}-shares`;
      const portfolioShares = await googleSheets.loadSheet<TargetShare[]>(
        sharesSheetTitle
      );

      const balanceFlatItem = totalBalanceFlat.find(
        item => item.portfolio === portfolio
      );
      const balanceFlat = balanceFlatItem ? balanceFlatItem.balance : [];

      const total = totalBalance.balance[portfolio]
        ? totalBalance.balance[portfolio].total
        : 0;

      const targetShares = getShareValues(portfolioShares, balanceFlat);
      const shares = getActualShares(targetShares, total);

      return { portfolio, shares };
    })
  );

  return { shares, total: totalBalance.total };
}

export default getShares;
