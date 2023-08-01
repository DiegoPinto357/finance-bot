import googleSheets from '../../../providers/googleSheets';
import deposit from './deposit';
import { fromCurrencyToNumber } from '../../../libs/stringFormat';
import { Month, FixedAsset, Portfolio } from '../../../types';

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

interface DistributeParams {
  month: Month;
  asset: FixedAsset;
}

export default async ({ month, asset }: DistributeParams) => {
  const rawDistributionData = await (<Promise<DistributionPortfolioItem[]>>(
    googleSheets.loadSheet('distribution')
  ));

  const totalRow = rawDistributionData.find(
    ({ portfolios }: { portfolios: string }) => portfolios === 'total'
  );
  const totalRowIndex = rawDistributionData.indexOf(totalRow!);

  const { portfolios, save, ...statusRow } =
    rawDistributionData[totalRowIndex + 1];
  const status: Status = (
    statusRow[month] ? statusRow[month][0] : 'notReady'
  ) as Status;

  if (status !== 'ready') {
    return { status: errorMessageMap[status] };
  }

  console.log(status);

  const firstDataRow = 1;
  const distributionData = rawDistributionData.slice(
    firstDataRow,
    totalRowIndex
  );

  const monthlyDistribution = distributionData.map(item => ({
    portfolio: item.portfolios,
    value: fromCurrencyToNumber(item[month][1]),
  }));

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
        executed: false,
      });
    } else {
      console.log(
        `[DEBUG]: Deposit ${depositItem.value} on ${asset} for ${depositItem.portfolio}`
      );
    }
  }

  return { status: 'ok' };
};
