import googleSheets from '../../../providers/googleSheets';
import { isAround1 } from './common';
import getBalance from './getBalance';
import getPortfolios from './getPortfolios';
import { flatPortfolioBalance } from './common';
import { AssetName, AssetClass, Portfolio } from '../../../types';
import { AssetBalanceWithClass } from './types';

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

const getShareValues = (
  portfolioTargetShares: TargetShare[],
  balanceFlat: AssetBalanceWithClass[]
) =>
  balanceFlat.reduce((sharesWithValues, balanceAssetItem) => {
    const filteredTargetShare = portfolioTargetShares.find(targetShareItem => {
      return (
        balanceAssetItem.assetClass === targetShareItem.assetClass &&
        (<unknown>targetShareItem.asset !== ''
          ? balanceAssetItem.asset === targetShareItem.asset
          : true)
      );
    });

    const baseShareWithValueItem = {
      assetClass: balanceAssetItem.assetClass,
      targetShare: filteredTargetShare ? filteredTargetShare.targetShare : 0,
      value: balanceAssetItem.value,
    };

    if (filteredTargetShare && <unknown>filteredTargetShare.asset === '') {
      const existingItem = sharesWithValues.find(
        ({ assetClass }) => assetClass === assetClass
      );

      if (!existingItem) {
        sharesWithValues.push(baseShareWithValueItem);
      } else {
        existingItem.value = existingItem.value + balanceAssetItem.value;
      }

      return sharesWithValues;
    }

    sharesWithValues.push({
      ...baseShareWithValueItem,
      asset: balanceAssetItem.asset,
    });

    return sharesWithValues;
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

interface Share {
  currentShare: number;
  diffBRL: number;
  assetClass: AssetClass;
  asset?: AssetName;
  targetShare: number;
  value: number;
}

interface SharesWithTotal {
  shares: Share[];
  total: number;
}

interface ShareByPortfolio {
  portfolio: Portfolio;
  shares: Share[];
}

interface SharesByPortfolioWithTotal {
  shares: ShareByPortfolio[];
  total: number;
}

function getShares(): Promise<SharesByPortfolioWithTotal>;
function getShares(portfolioName?: Portfolio): Promise<SharesWithTotal>;
async function getShares(portfolioName?: Portfolio) {
  if (portfolioName) {
    const sharesSheetTitle = `portfolio-${portfolioName}-shares`;
    const [{ balance, total }, portfoliotTargetShares] = await Promise.all([
      getBalance(portfolioName),
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
}

export default getShares;
