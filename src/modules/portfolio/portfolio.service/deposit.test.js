import binance from '../../../providers/binance';
import fixedService from '../../fixed/fixed.service';
import stockService from '../../stock/stock.service';
import cryptoService from '../../crypto/crypto.service';
import getBalance from './getBalance';
import deposit from './deposit';

jest.mock('../../../providers/database');
jest.mock('../../../providers/tradingView');
jest.mock('../../../providers/binance');
jest.mock('../../../providers/coinMarketCap');
jest.mock('../../../providers/blockchain');

const services = {
  fixed: fixedService,
  stock: stockService,
  crypto: cryptoService,
};

// TODO import it from common.js
const getAssetValueFromBalance = ({ balance }, assetClass, assetName) => {
  const assetBalance = balance[assetClass].balance.find(
    item => item.asset === assetName
  );
  return assetBalance ? assetBalance.value : 0;
};

describe('portfolio service - deposit', () => {
  const deposits = [
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
      if (assetClass === 'stock') assetName = 'float';

      const currentPortfolioBalance = await getBalance(portfolioName);
      const currentPortfolioAssetValue = getAssetValueFromBalance(
        currentPortfolioBalance,
        assetClass,
        assetName
      );

      const curentSidePortfolioBalance = sidePortfolioName
        ? await getBalance(sidePortfolioName)
        : null;

      const service = services[assetClass];
      const currentTotalAssetValue = await service.getAssetPosition(assetName);

      const result = await deposit({
        value: depositValue,
        portfolio: portfolioName,
        assetClass,
        assetName,
      });

      if (assetClass === 'crypto') {
        await binance.simulateBRLDeposit(depositValue);
      }

      const newPortfolioBalance = await getBalance(portfolioName);
      const newPortfolioAssetValue = getAssetValueFromBalance(
        newPortfolioBalance,
        assetClass,
        assetName
      );

      const newSidePortfolioBalance = sidePortfolioName
        ? await getBalance(sidePortfolioName)
        : null;

      const newTotalAssetValue = await service.getAssetPosition(assetName);

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

    await binance.simulateBRLDeposit(depositValue);

    const result = await deposit({
      value: depositValue,
      portfolio: portfolioName,
      assetClass,
      assetName,
      executed: true,
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
});
