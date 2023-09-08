import database from '../../../providers/database';
import getBalance from './getBalance';
import distribute from './distribute';
import { getPortfolioPositionOnAsset } from './common';
import { fromCurrencyToNumber } from '../../../libs/stringFormat';
import distributionData from '../../../../mockData/googleSheets/distribution.json';
import { Month, FixedAsset, Portfolio } from '../../../types';

type MockDatabase = typeof database & { resetMockValues: () => void };

jest.mock('../../../providers/googleSheets');
jest.mock('../../../providers/database');
jest.mock('../../../providers/tradingView');
jest.mock('../../../providers/binance');
jest.mock('../../../providers/mercadoBitcoin');
jest.mock('../../../providers/coinMarketCap');
jest.mock('../../../providers/blockchain');

type RawDistributionData = typeof distributionData;

interface MonthlyDistribution {
  portfolio: Portfolio;
  value: number;
}

const getMothlyDistributions = (
  distributionData: RawDistributionData,
  month: Month
) =>
  distributionData.slice(1, 16).map(item => {
    const { portfolios, total, ...monthlyData } = item;
    return {
      portfolio: portfolios ? portfolios : '',
      value: fromCurrencyToNumber(monthlyData[month]![1]!),
    } as MonthlyDistribution;
  });

describe('portfolio service - distribute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (database as MockDatabase).resetMockValues();
  });

  it('distributes values on portfolios', async () => {
    const month = 'sep';
    const asset: FixedAsset = 'nubank';

    const monthlyDistributions = getMothlyDistributions(
      distributionData,
      month
    );

    const currentValues = await Promise.all(
      monthlyDistributions.map(
        async distribution =>
          await getPortfolioPositionOnAsset(distribution.portfolio, {
            class: 'fixed',
            name: asset,
          })
      )
    );

    const { status } = await distribute({ month, asset });

    const newValues = await Promise.all(
      monthlyDistributions.map(
        async distribution =>
          await getPortfolioPositionOnAsset(distribution.portfolio, {
            class: 'fixed',
            name: asset,
          })
      )
    );

    expect(status).toBe('ok');
    monthlyDistributions.forEach((deposit, index) => {
      expect(newValues[index]).toBeCloseTo(
        currentValues[index] + deposit.value,
        5
      );
    });
  });

  describe('distribution status', () => {
    it('does not distribute if status is "notReady', async () => {
      const month = 'nov';
      const asset: FixedAsset = 'nubank';

      const currentBalance = await getBalance();

      const { status } = await distribute({ month, asset });

      const newBalance = await getBalance();

      expect(status).toBe('distributionNotReady');
      expect(newBalance).toEqual(currentBalance);
    });

    it('does not distribute if status is "done', async () => {
      const month = 'feb';
      const asset: FixedAsset = 'nubank';

      const currentBalance = await getBalance();

      const { status } = await distribute({ month, asset });

      const newBalance = await getBalance();

      expect(status).toBe('distributionAlreadyDone');
      expect(newBalance).toEqual(currentBalance);
    });
  });

  // it.skip('returns a status error if something goes wrong', async () => {
  //   // portfolio does not exists
  //   // not fixed asset?
  //   // general dependency error
  // });
});
