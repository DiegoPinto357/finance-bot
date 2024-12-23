import binance from '../../../providers/binance';
import cryptoService from '../../crypto/crypto.service';
import getBalance from './getBalance';
import deposit from './deposit';
import { getAssetValueFromBalance, getAssetPosition } from './common';

import type { AssetClass, AssetName } from '../../../types';
import type { Portfolio } from '../../../schemas';

type MockBinance = typeof binance & {
  simulateBRLDeposit: (value: number) => void;
};

jest.mock('../../../providers/database');
jest.mock('../../../providers/brapi');
jest.mock('../../../providers/binance');
jest.mock('../../../providers/mercadoBitcoin');
jest.mock('../../../providers/coinMarketCap');
jest.mock('../../../providers/blockchain');

describe('portfolio service - deposit', () => {
  type Deposit = {
    depositValue: number;
    portfolioName: Portfolio;
    assetClass: AssetClass;
    assetName: AssetName;
    sidePortfolioName: Portfolio | null;
  };

  const deposits: Deposit[] = [
    {
      depositValue: 1000,
      portfolioName: 'suricat',
      assetClass: 'fixed',
      assetName: 'nubank',
      sidePortfolioName: 'congelamentoSuricats',
    },
    {
      depositValue: 99.99,
      portfolioName: 'suricat',
      assetClass: 'fixed',
      assetName: 'nubank',
      sidePortfolioName: 'congelamentoSuricats',
    },
    {
      depositValue: 10,
      portfolioName: 'suricat',
      assetClass: 'fixed',
      assetName: 'nubank',
      sidePortfolioName: 'reformaCasa',
    },
    {
      depositValue: 150,
      portfolioName: 'suricat',
      assetClass: 'fixed',
      assetName: 'nubank',
      sidePortfolioName: 'previdencia',
    },
    {
      depositValue: 100,
      portfolioName: 'previdencia',
      assetClass: 'stock',
      assetName: 'float',
      sidePortfolioName: null,
    },
    {
      depositValue: 100,
      portfolioName: 'previdencia',
      assetClass: 'crypto',
      assetName: 'hodl',
      sidePortfolioName: 'financiamento',
    },
    {
      depositValue: 100,
      portfolioName: 'carro',
      assetClass: 'crypto',
      assetName: 'binanceBuffer',
      sidePortfolioName: 'amortecedor',
    },
  ];

  it.each(deposits)(
    'deposits $depositValue on "$portfolioName" ($assetClass/$assetName) - also checks "$sidePortfolioName"',
    async ({
      depositValue,
      portfolioName,
      assetClass,
      assetName,
      sidePortfolioName,
    }) => {
      const currentPortfolioBalance = await getBalance(portfolioName);
      const currentPortfolioAssetValue = getAssetValueFromBalance(
        currentPortfolioBalance,
        assetClass,
        assetName
      );

      const curentSidePortfolioBalance = sidePortfolioName
        ? await getBalance(sidePortfolioName)
        : null;

      const currentTotalAssetValue = await getAssetPosition(
        assetClass,
        assetName
      );

      if (assetClass === 'crypto') {
        (binance as MockBinance).simulateBRLDeposit(depositValue);
      }

      const result = await deposit({
        value: depositValue,
        portfolio: portfolioName,
        assetClass,
        assetName,
      });

      const newPortfolioBalance = await getBalance(portfolioName);
      const newPortfolioAssetValue = getAssetValueFromBalance(
        newPortfolioBalance,
        assetClass,
        assetName
      );

      const newSidePortfolioBalance = sidePortfolioName
        ? await getBalance(sidePortfolioName)
        : null;

      const newTotalAssetValue = await getAssetPosition(assetClass, assetName);

      expect(result.status).toBe('ok');
      expect(newPortfolioAssetValue).toBe(
        currentPortfolioAssetValue + depositValue
      );
      expect(newSidePortfolioBalance).toEqual(curentSidePortfolioBalance);
      expect(newTotalAssetValue).toBe(currentTotalAssetValue + depositValue);
    }
  );

  it('register a deposit on Binance HODL after the real deposit was done', async () => {
    const depositValue = 500;
    const portfolioName = 'previdencia';
    const assetClass = 'crypto';
    const assetName = 'hodl';
    const sidePortfolioName = 'amortecedor';

    const currentPortfolioBalance = await getBalance(portfolioName);
    const currentPortfolioAssetValue = getAssetValueFromBalance(
      currentPortfolioBalance,
      assetClass,
      assetName
    );

    const curentSidePortfolioBalance = sidePortfolioName
      ? await getBalance(sidePortfolioName)
      : null;

    const currentTotalAssetValue = await cryptoService.getAssetPosition(
      assetName
    );

    (binance as MockBinance).simulateBRLDeposit(depositValue);

    const result = await deposit({
      value: depositValue,
      portfolio: portfolioName,
      assetClass,
      assetName,
    });

    const newPortfolioBalance = await getBalance(portfolioName);
    const newPortfolioAssetValue = getAssetValueFromBalance(
      newPortfolioBalance,
      assetClass,
      assetName
    );

    const newSidePortfolioBalance = sidePortfolioName
      ? await getBalance(sidePortfolioName)
      : null;

    const newTotalAssetValue = await cryptoService.getAssetPosition(assetName);

    expect(result.status).toBe('ok');
    expect(newPortfolioAssetValue).toBeCloseTo(
      currentPortfolioAssetValue + depositValue,
      5
    );
    expect(newSidePortfolioBalance).toEqual(curentSidePortfolioBalance);
    expect(newTotalAssetValue).toBeCloseTo(
      currentTotalAssetValue + depositValue,
      5
    );
  });

  it('does not deposit negative values (withdraw) when there are no funds available', async () => {
    const depositValue = -10000;
    const portfolioName = 'suricat';
    const assetClass = 'fixed';
    const assetName = 'nubank';

    const currentBalance = await getBalance(portfolioName);
    const currentAssetValue = getAssetValueFromBalance(
      currentBalance,
      assetClass,
      assetName
    );

    const result = await deposit({
      value: depositValue,
      portfolio: portfolioName,
      assetClass,
      assetName,
    });

    const newBalance = await getBalance(portfolioName);
    const newAssetValue = getAssetValueFromBalance(
      newBalance,
      assetClass,
      assetName
    );

    expect(result.status).toBe('notEnoughFunds');
    expect(newAssetValue).toBe(currentAssetValue);
  });

  it.todo('consider share value as 0 when it i super small');

  it.todo('consider deposit value as 0 when it i super small');
});
