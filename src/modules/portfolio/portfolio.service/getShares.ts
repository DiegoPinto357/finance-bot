import googleSheets from '../../../providers/googleSheets';
import { isAround1 } from './common';
import getBalance from './getBalance';
import getPortfolios from './getPortfolios';
import { AssetName, AssetClass, Portfolio } from '../../../types';
import {
  AssetBalance,
  BalanceByAsset,
  BalanceByAssetWithTotal,
  BalanceByPortfolioWithTotal,
} from './types';

type AssetBalanceWithClass = AssetBalance & {
  assetClass: AssetClass;
};

interface TargetShare {
  assetClass: AssetClass;
  asset: AssetName;
  targetShare: number;
}

interface TargetShareWithValue {
  assetClass: AssetClass;
  asset?: AssetName;
  targetShare: number;
  value: number;
}

const flatPortfolioBalance = (balance: BalanceByAsset) => [
  ...balance.fixed.balance.map(item => ({
    assetClass: <AssetClass>'fixed',
    ...item,
  })),
  ...balance.stock.balance.map(item => ({
    assetClass: <AssetClass>'stock',
    ...item,
  })),
  ...balance.crypto.balance.map(item => ({
    assetClass: <AssetClass>'crypto',
    ...item,
  })),
];

const getShareValues = (
  portfolioTargetShares: TargetShare[],
  balanceFlat: AssetBalanceWithClass[]
) =>
  balanceFlat.reduce((shares, { assetClass, asset, liquidity, value }) => {
    const { share, status } = findShare(
      portfolioTargetShares,
      assetClass,
      asset
    );

    const shareItem = { assetClass, value };

    if (status === 'notFound') {
      shares.push({
        ...shareItem,
        asset,
        targetShare: 0,
      });

      return shares;
    }

    if (status === 'hasNoAssetName') {
      const shareClassItem = shares.find(
        ({ assetClass }) => assetClass === assetClass
      );

      if (!shareClassItem) {
        shares.push({
          ...shareItem,
          targetShare: share ? share.targetShare : 0,
        });
      } else {
        shareClassItem.value = shareClassItem.value + value;
      }

      return shares;
    }

    shares.push({
      ...shareItem,
      asset,
      targetShare: share ? share.targetShare : 0,
    });

    return shares;
  }, [] as TargetShareWithValue[]);

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

const findShare = (
  targetShares: TargetShare[],
  assetClass: AssetClass,
  asset: AssetName
) => {
  let share = targetShares.find(
    share => asset === share.asset && assetClass === share.assetClass
  );

  if (!share) {
    share = targetShares.find(
      // FIXME remove unkown typecast
      share => assetClass === share.assetClass && <unknown>share.asset === ''
    );

    if (!share) {
      return { status: 'notFound' };
    }

    return { share, status: 'hasNoAssetName' };
  }

  return { share, status: 'hasAssetName' };
};

export default async (portfolioName?: Portfolio) => {
  if (portfolioName) {
    const sharesSheetTitle = `portfolio-${portfolioName}-shares`;
    const [{ balance, total }, portfoliotTargetShares] = await Promise.all([
      // TODO remove type cast as getBalance type is defined
      <Promise<BalanceByAssetWithTotal>>getBalance(portfolioName),
      // TODO use generic on loadSheet method
      <Promise<TargetShare[]>>googleSheets.loadSheet(sharesSheetTitle),
    ]);

    const balanceFlat = flatPortfolioBalance(balance);
    const targetSharesWithValues = getShareValues(
      portfoliotTargetShares,
      balanceFlat
    );
    const shares = getActualShares(targetSharesWithValues, total);

    return { shares, total };
  }

  // TODO remove type cast as getBalance type is defined
  const totalBalance = await (<Promise<BalanceByPortfolioWithTotal>>(
    getBalance()
  ));
  const totalBalanceFlat = Object.entries(totalBalance.balance).map(
    ([key, value]) => ({
      portfolio: key as Portfolio,
      balance: flatPortfolioBalance(value.balance),
    })
  );

  // TODO remove type cast as getPortfolios type is defined
  const portfolios = await (<Promise<Portfolio[]>>getPortfolios());
  const shares = await Promise.all(
    portfolios.map(async portfolio => {
      const sharesSheetTitle = `portfolio-${portfolio}-shares`;
      const portfolioShares = await (<Promise<TargetShare[]>>(
        googleSheets.loadSheet(sharesSheetTitle)
      ));

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
};
