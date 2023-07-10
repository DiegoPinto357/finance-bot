import database from '../../../providers/database';
import getBalance from './getBalance';
import distribute from './distribute';
import { getAssetValueFromBalance } from './common';
import { fromCurrencyToNumber } from '../../../libs/stringFormat';
import { BalanceByPortfolioWithTotal } from './types';
import distributionData from '../../../../mockData/googleSheets/distribution.json';
import { FixedAsset, Portfolio } from '../../../types';

type MockDatabase = typeof database & { resetMockValues: () => void };

jest.mock('../../../providers/googleSheets');
jest.mock('../../../providers/database');
jest.mock('../../../providers/tradingView');
jest.mock('../../../providers/binance');
jest.mock('../../../providers/coinMarketCap');
jest.mock('../../../providers/blockchain');

interface MonthlyDistribution {
  portfolio: Portfolio;
  value: number;
}

const month = 'may';
const monthlyDistributions = distributionData.slice(1, 16).map(
  item =>
    ({
      portfolio: item.portfolios,
      value: fromCurrencyToNumber(item[month]![1]),
    } as MonthlyDistribution)
);

describe('portfolio service - distribute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (database as MockDatabase).resetMockValues();
  });

  it('distributes values on portfolios', async () => {
    const asset: FixedAsset = 'nubank';

    // TODO remove typecast as getBalance type is defined
    const currentBalance = await (<Promise<BalanceByPortfolioWithTotal>>(
      getBalance()
    ));

    const { status } = await distribute(month, asset);

    // TODO remove typecast as getBalance type is defined
    const newBalance = await (<Promise<BalanceByPortfolioWithTotal>>(
      getBalance()
    ));

    expect(status).toBe('ok');
    monthlyDistributions.forEach(deposit => {
      const currentValue = getAssetValueFromBalance(
        currentBalance.balance[deposit.portfolio],
        'fixed',
        asset
      );

      const newValue = getAssetValueFromBalance(
        newBalance.balance[deposit.portfolio],
        'fixed',
        asset
      );

      expect(newValue).toBeCloseTo(currentValue + deposit.value, 5);
    });
  });

  it('does not distribute when status is ot ready', async () => {
    // update status after distribution is done
  });

  it('does not distributes when when selected month is not the current one', async () => {
    // automatically distribute to the current month?
  });

  it('returns a status error if something goes wrong', async () => {
    // portfolio does not exists
    // not fixed asset?
    // general dependency error
  });
});
