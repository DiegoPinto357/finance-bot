import database from '../../../providers/database';
import binance from '../../../providers/binance';
import { getAssetValueFromBalance } from './common';
import getBalance from './getBalance';
import transfer from './transfer';

jest.mock('../../../providers/googleSheets');
jest.mock('../../../providers/database');
jest.mock('../../../providers/tradingView');
jest.mock('../../../providers/binance');
jest.mock('../../../providers/mercadoBitcoin');
jest.mock('../../../providers/coinMarketCap');
jest.mock('../../../providers/blockchain');

describe('portfolio service - transfer', () => {
  beforeEach(() => {
    database.resetMockValues();
  });

  const transfers = [
    {
      value: 100,
      portfolio: 'financiamento',
      origin: { class: 'fixed', name: 'nubank' },
      destiny: { class: 'fixed', name: 'xpWesternAsset' },
    },
    {
      value: 124.67,
      portfolio: 'financiamento',
      origin: { class: 'fixed', name: 'nubank' },
      destiny: { class: 'crypto', name: 'hodl' },
    },
    {
      value: 1000,
      portfolio: 'previdencia',
      origin: { class: 'fixed', name: 'nubank' },
      destiny: { class: 'stock', name: 'float' },
    },
    {
      value: 100,
      portfolio: 'amortecedor',
      origin: { class: 'fixed', name: 'nubank' },
      destiny: { class: 'crypto', name: 'backed' },
    },
  ];

  it.each(transfers)(
    'transfer funds for $portfolio from $origin.class/$origin.name to $destiny.class/$destiny.name"',
    async ({ value, portfolio, origin, destiny }) => {
      const currentPortfolioBalance = await getBalance(portfolio);

      const currentPortfolioOriginValue = getAssetValueFromBalance(
        currentPortfolioBalance,
        origin.class,
        origin.name
      );

      const currentPortfolioDestinyValue = getAssetValueFromBalance(
        currentPortfolioBalance,
        destiny.class,
        destiny.name
      );

      const response = await transfer({
        value,
        portfolio,
        origin,
        destiny,
      });

      if (destiny.class === 'crypto') {
        await binance.simulateBRLDeposit(value);
      }

      const newPortfolioBalance = await getBalance(portfolio);

      const newPortfolioOriginValue = getAssetValueFromBalance(
        newPortfolioBalance,
        origin.class,
        origin.name
      );

      const newPortfolioDestinyValue = getAssetValueFromBalance(
        newPortfolioBalance,
        destiny.class,
        destiny.name
      );

      expect(response.status).toBe('ok');
      expect(newPortfolioOriginValue).toBeCloseTo(
        currentPortfolioOriginValue - value,
        5
      );
      expect(newPortfolioDestinyValue).toBeCloseTo(
        currentPortfolioDestinyValue + value,
        5
      );
    }
  );

  it('register a transfer to Binance HODL after the real trasfer was done', async () => {
    const value = 124.67;
    const portfolio = 'financiamento';
    const origin = { class: 'fixed', name: 'nubank' };
    const destiny = { class: 'crypto', name: 'hodl' };

    const currentPortfolioBalance = await getBalance(portfolio);

    const currentPortfolioOriginValue = getAssetValueFromBalance(
      currentPortfolioBalance,
      origin.class,
      origin.name
    );

    const currentPortfolioDestinyValue = getAssetValueFromBalance(
      currentPortfolioBalance,
      destiny.class,
      destiny.name
    );

    await binance.simulateBRLDeposit(value);

    const response = await transfer({
      value,
      portfolio,
      origin,
      destiny,
      destinyExecuted: true,
    });

    const newPortfolioBalance = await getBalance(portfolio);

    const newPortfolioOriginValue = getAssetValueFromBalance(
      newPortfolioBalance,
      origin.class,
      origin.name
    );

    const newPortfolioDestinyValue = getAssetValueFromBalance(
      newPortfolioBalance,
      destiny.class,
      destiny.name
    );

    expect(response.status).toBe('ok');
    expect(newPortfolioOriginValue).toBe(currentPortfolioOriginValue - value);
    expect(newPortfolioDestinyValue).toBe(currentPortfolioDestinyValue + value);
  });

  it('does not transfer when there is no funds available', async () => {
    const value = 10000;
    const portfolio = 'financiamento';
    const origin = { class: 'fixed', name: 'nubank' };
    const destiny = { class: 'crypto', name: 'defi' };

    const response = await transfer({
      value,
      portfolio,
      origin,
      destiny,
    });

    const portfolioBalance = await getBalance(portfolio);

    const portfolioOriginValue = getAssetValueFromBalance(
      portfolioBalance,
      origin.class,
      origin.name
    );

    const portfolioDestinyValue = getAssetValueFromBalance(
      portfolioBalance,
      destiny.class,
      destiny.name
    );

    expect(response.status).toBe('notEnoughFunds');
    expect(portfolioOriginValue).toBe(5153.352886268896);
    expect(portfolioDestinyValue).toBe(266.5505693764885);
  });

  it('transfer funds to an asset without shares definition', async () => {
    const value = 100;
    const portfolio = 'financiamento';
    const origin = { class: 'fixed', name: 'nubank' };
    const destiny = { class: 'fixed', name: 'poupancaBamerindus' };

    const currentPortfolioBalance = await getBalance(portfolio);

    const currentPortfolioOriginValue = getAssetValueFromBalance(
      currentPortfolioBalance,
      origin.class,
      origin.name
    );

    const currentPortfolioDestinyValue = getAssetValueFromBalance(
      currentPortfolioBalance,
      destiny.class,
      destiny.name
    );

    const response = await transfer({
      value,
      portfolio,
      origin,
      destiny,
    });

    const newPortfolioBalance = await getBalance(portfolio);

    const newPortfolioOriginValue = getAssetValueFromBalance(
      newPortfolioBalance,
      origin.class,
      origin.name
    );

    const newPortfolioDestinyValue = getAssetValueFromBalance(
      newPortfolioBalance,
      destiny.class,
      destiny.name
    );

    expect(response.status).toBe('ok');
    expect(newPortfolioOriginValue).toBeCloseTo(
      currentPortfolioOriginValue - value,
      5
    );
    expect(newPortfolioDestinyValue).toBeCloseTo(
      currentPortfolioDestinyValue + value,
      5
    );
  });

  it('transfer all funds from a portfolio', async () => {
    const value = 'all';
    const portfolio = 'financiamento';
    const origin = { class: 'fixed', name: 'nubank' };
    const destiny = { class: 'fixed', name: 'iti' };

    const currentPortfolioBalance = await getBalance(portfolio);

    const currentPortfolioOriginValue = getAssetValueFromBalance(
      currentPortfolioBalance,
      origin.class,
      origin.name
    );

    const currentPortfolioDestinyValue = getAssetValueFromBalance(
      currentPortfolioBalance,
      destiny.class,
      destiny.name
    );

    const response = await transfer({
      value,
      portfolio,
      origin,
      destiny,
    });

    if (destiny.class === 'crypto') {
      await binance.simulateBRLDeposit(value);
    }

    const newPortfolioBalance = await getBalance(portfolio);

    const newPortfolioOriginValue = getAssetValueFromBalance(
      newPortfolioBalance,
      origin.class,
      origin.name
    );

    const newPortfolioDestinyValue = getAssetValueFromBalance(
      newPortfolioBalance,
      destiny.class,
      destiny.name
    );

    expect(response.status).toBe('ok');
    expect(newPortfolioOriginValue).toBe(0);
    expect(newPortfolioDestinyValue).toBe(
      currentPortfolioDestinyValue + currentPortfolioOriginValue
    );
  });

  it('transfer all funds from an asset', async () => {
    const value = 'all';
    const portfolio = 'financiamento';
    const origin = { class: 'fixed', name: '99pay' };
    const destiny = { class: 'fixed', name: 'iti' };

    const currentPortfolioBalance = await getBalance(portfolio);

    const currentPortfolioOriginValue = getAssetValueFromBalance(
      currentPortfolioBalance,
      origin.class,
      origin.name
    );

    const currentPortfolioDestinyValue = getAssetValueFromBalance(
      currentPortfolioBalance,
      destiny.class,
      destiny.name
    );

    const response = await transfer({
      value,
      portfolio,
      origin,
      destiny,
    });

    if (destiny.class === 'crypto') {
      await binance.simulateBRLDeposit(value);
    }

    const newPortfolioBalance = await getBalance(portfolio);

    const newPortfolioOriginValue = getAssetValueFromBalance(
      newPortfolioBalance,
      origin.class,
      origin.name
    );

    const newPortfolioDestinyValue = getAssetValueFromBalance(
      newPortfolioBalance,
      destiny.class,
      destiny.name
    );

    expect(response.status).toBe('ok');
    expect(newPortfolioOriginValue).toBe(0);
    expect(newPortfolioDestinyValue).toBe(
      currentPortfolioDestinyValue + currentPortfolioOriginValue
    );
  });
});
