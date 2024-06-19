import googleSheets from '../../../providers/googleSheets';
import deposit from './deposit';
import { fromCurrencyToNumber } from '../../../libs/stringFormat';

import type { Month } from '../../../types';
import type { FixedAsset, Portfolio } from '../../../schemas';

const debug = false;

const errorMessageMap: Record<Status, string> = {
  notReady: 'distributionNotReady',
  done: 'distributionAlreadyDone',
  ready: 'ok',
};

type DistributionPortfolioItem = {
  portfolios: Portfolio;
  save: (...args: any) => any;
} & Record<Month, [string, string]>;

type Status = 'notReady' | 'ready' | 'done';

const parseDistributionData = (
  rawDistributionData: DistributionPortfolioItem[],
  month: Month
) => {
  const totalRow = rawDistributionData.find(
    ({ portfolios }: { portfolios: string }) => portfolios === 'total'
  );
  const totalRowIndex = rawDistributionData.indexOf(totalRow!);

  const { portfolios, save, ...statusRow } =
    rawDistributionData[totalRowIndex + 1];
  const status: Status = (
    statusRow[month]
      ? Array.isArray(statusRow[month])
        ? statusRow[month][0]
        : statusRow[month]
      : 'notReady'
  ) as Status;

  if (status !== 'ready') {
    return { status };
  }

  const firstDataRow = 1;
  const distributionData = rawDistributionData.slice(
    firstDataRow,
    totalRowIndex
  );

  const monthlyDistribution = distributionData.map(item => ({
    portfolio: item.portfolios,
    value: fromCurrencyToNumber(item[month][1]),
  }));

  return { monthlyDistribution, status };
};

interface DistributeParams {
  month: Month;
  asset: FixedAsset;
}

export default async ({ month, asset }: DistributeParams) => {
  const rawDistributionData = await googleSheets.loadSheet<
    DistributionPortfolioItem[]
  >('distribution');

  const { monthlyDistribution, status } = parseDistributionData(
    rawDistributionData,
    month
  );

  if (status !== 'ready') {
    return { status: errorMessageMap[status] };
  }

  const nonZeroMonthlyDistribution = monthlyDistribution.filter(
    ({ value }) => value
  );

  for (const depositItem of nonZeroMonthlyDistribution) {
    if (!debug) {
      await deposit({
        value: depositItem.value,
        portfolio: depositItem.portfolio,
        assetClass: 'fixed',
        assetName: asset,
      });
    } else {
      console.log(
        `[DEBUG]: Deposit ${depositItem.value} on ${asset} for ${depositItem.portfolio}`
      );
    }
  }

  return { status: 'ok' };
};
