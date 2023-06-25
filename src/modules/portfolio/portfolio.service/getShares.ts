import googleSheets from '../../../providers/googleSheets';
import { isAround1 } from './common';
import getBalance from './getBalance';
import getPortfolios from './getPortfolios';
import { AssetClass, Asset, Portfolio } from '../../../types';

interface AssetBalance {
  asset: Asset;
  value: number;
}

type AssetBalanceWithClass = AssetBalance & {
  assetClass: AssetClass;
};

interface Balance {
  fixed: {
    balance: AssetBalance[];
    total: number;
  };
  stock: {
    balance: AssetBalance[];
    total: number;
  };
  crypto: {
    balance: AssetBalance[];
    total: number;
  };
}

interface BalanceForSinglePortfolio {
  balance: Balance;
  total: number;
}

type BalanceByPortfolio = {
  [key in Portfolio]: {
    balance: Balance;
    total: number;
  };
};

interface BalanceWithTotal {
  balance: BalanceByPortfolio;
  total: number;
}

interface TargetShare {
  assetClass: AssetClass;
  asset: Asset;
  targetShare: number;
}

interface TargetShareWithValue {
  assetClass: AssetClass;
  asset?: Asset;
  targetShare: number;
  value: number;
}

const flatPortfolioBalance = (balance: Balance) => [
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

const mapTargetShares = (
  portfolioShares: TargetShare[],
  balanceFlat: AssetBalanceWithClass[]
) =>
  balanceFlat.reduce((shares, { assetClass, asset, value }) => {
    const { share, status } = findShare(portfolioShares, assetClass, asset);

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

const mapActualShares = (
  targetShares: TargetShareWithValue[],
  total: number
) => {
  const totalTargetShare = targetShares.reduce(
    (total, { targetShare }) => total + targetShare,
    0
  );

  const isTargetSharesAvailable = isAround1(totalTargetShare);

  return targetShares
    .map(share => {
      const currentShare = share.value / total;
      const diffBRL = isTargetSharesAvailable
        ? share.targetShare * total - share.value
        : 0;

      return { ...share, currentShare, diffBRL };
    })
    .sort((a, b) =>
      isTargetSharesAvailable ? b.diffBRL - a.diffBRL : a.value - b.value
    );
};

const findShare = (
  shares: TargetShare[],
  assetClass: AssetClass,
  asset: Asset
) => {
  let share = shares.find(
    share => asset === share.asset && assetClass === share.assetClass
  );

  if (!share) {
    share = shares.find(
      // FIXME remove unkown cats
      share => assetClass === share.assetClass && <unknown>share.asset === ''
    );

    if (!share) {
      return { status: 'notFound' };
    }

    return { share, status: 'hasNoAssetName' };
  }

  return { share, status: 'hasAssetName' };
};

export default async (portfolioName: Portfolio) => {
  if (portfolioName) {
    const sharesSheetTitle = `portfolio-${portfolioName}-shares`;
    const [{ balance, total }, portfolioShares] = await Promise.all([
      // TODO remove type cast as getBalance type is defined
      <Promise<BalanceForSinglePortfolio>>getBalance(portfolioName),
      googleSheets.loadSheet(sharesSheetTitle),
    ]);

    const balanceFlat = flatPortfolioBalance(balance);
    const targetShares = mapTargetShares(portfolioShares, balanceFlat);
    const shares = mapActualShares(targetShares, total);

    return { shares, total };
  }

  // TODO remove type cast as getBalance type is defined
  const totalBalance = await (<Promise<BalanceWithTotal>>getBalance());
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

      const targetShares = mapTargetShares(portfolioShares, balanceFlat);
      const shares = mapActualShares(targetShares, total);

      return { portfolio, shares };
    })
  );

  return { shares, total: totalBalance.total };
};
