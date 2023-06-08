import googleSheets from '../../../providers/googleSheets';
import { isAround1 } from './common';
import getBalance from './getBalance';
import getPortfolios from './getPortfolios';

const flatPortfolioBalance = balance => [
  ...balance.fixed.balance.map(item => ({ assetClass: 'fixed', ...item })),
  ...balance.stock.balance.map(item => ({ assetClass: 'stock', ...item })),
  ...balance.crypto.balance.map(item => ({
    assetClass: 'crypto',
    ...item,
  })),
];

const mapTargetShares = (portfolioShares, balanceFlat) =>
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
      targetShare: share.targetShare,
    });

    return shares;
  }, []);

const mapActualShares = (targetShares, total) => {
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

const findShare = (shares, assetClass, asset) => {
  let share = shares.find(
    share => asset === share.asset && assetClass === share.assetClass
  );

  if (!share) {
    share = shares.find(
      share => assetClass === share.assetClass && share.asset === ''
    );

    if (!share) {
      return { status: 'notFound' };
    }

    return { share, status: 'hasNoAssetName' };
  }

  return { share, status: 'hasAssetName' };
};

export default async portfolioName => {
  if (portfolioName) {
    const sharesSheetTitle = `portfolio-${portfolioName}-shares`;
    const [{ balance, total }, portfolioShares] = await Promise.all([
      getBalance(portfolioName),
      googleSheets.loadSheet(sharesSheetTitle),
    ]);

    const balanceFlat = flatPortfolioBalance(balance);
    const targetShares = mapTargetShares(portfolioShares, balanceFlat);
    const shares = mapActualShares(targetShares, total);

    return { shares, total };
  }

  const totalBalance = await getBalance();
  const totalBalanceFlat = Object.entries(totalBalance.balance).map(
    ([key, value]) => ({
      portfolio: key,
      balance: flatPortfolioBalance(value.balance),
    })
  );

  const portfolios = await getPortfolios();
  const shares = await Promise.all(
    portfolios.map(async portfolio => {
      const sharesSheetTitle = `portfolio-${portfolio}-shares`;
      const portfolioShares = await googleSheets.loadSheet(sharesSheetTitle);

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
