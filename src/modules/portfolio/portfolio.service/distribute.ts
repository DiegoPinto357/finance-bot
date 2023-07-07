import googleSheets from '../../../providers/googleSheets';
import deposit from './deposit';
import { fromCurrencyToNumber } from '../../../libs/stringFormat';
import { FixedAsset, Portfolio } from '../../../types';

type Month =
  | 'jan'
  | 'fev'
  | 'mar'
  | 'apr'
  | 'may'
  | 'jun'
  | 'jul'
  | 'aug'
  | 'sep'
  | 'oct'
  | 'nov'
  | 'dec';

type DistributionMonthItem = {
  [key in Month]: [string, string];
};

type DistributionPortfolioItem = {
  portfolios: Portfolio;
} & DistributionMonthItem;

export default async (month: Month, asset: FixedAsset) => {
  const rawDistributionData = await (<Promise<DistributionPortfolioItem[]>>(
    googleSheets.loadSheet('distribution')
  ));

  const firstRow = 1;
  const totalRow = rawDistributionData.find(
    ({ portfolios }: { portfolios: string }) => portfolios === 'total'
  );
  const totalRowIndex = rawDistributionData.indexOf(totalRow!);
  const distributionData = rawDistributionData.slice(firstRow, totalRowIndex);

  const monthlyDistribution = distributionData.map(item => {
    return {
      portfolio: item.portfolios,
      value: fromCurrencyToNumber(item[month][1]),
    };
  });

  const nonZeroMonthlyDistribution = monthlyDistribution.filter(
    ({ value }) => value
  );

  for (const depositItem of nonZeroMonthlyDistribution) {
    await deposit({
      value: depositItem.value,
      portfolio: depositItem.portfolio,
      assetClass: 'fixed',
      assetName: asset,
      executed: false,
    });
  }

  return { status: 'ok' };
};
