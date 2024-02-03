import database from '../../../providers/database';
import binance from '../../../providers/binance';
import blockchain from '../../../providers/blockchain';
import mercadoBitcoin from '../../../providers/mercadoBitcoin';
import coinMarketCap from '../../../providers/coinMarketCap';
import { getAssetValueFromBalance } from './common';
import getBalance from './getBalance';
import transfer from './transfer';
import { Asset, Portfolio, FixedAsset } from '../../../types';

type MockDatabase = typeof database & { resetMockValues: () => void };

type MockBinance = typeof binance & {
  simulateDeposit: (assetName: string, amount: number) => void;
  simulateBRLDeposit: (value: number) => void;
};

type MockBlockchain = typeof blockchain & {
  simulateDeposit: (wallet: string, assetname: string, amount: number) => void;
  resetMockValues: () => void;
};

type MockMercadoBitcoin = typeof mercadoBitcoin & {
  simulateBRLDeposit: (value: number) => void;
};

jest.mock('../../../providers/googleSheets');
jest.mock('../../../providers/database');
jest.mock('../../../providers/brapi');
jest.mock('../../../providers/binance');
jest.mock('../../../providers/mercadoBitcoin');
jest.mock('../../../providers/coinMarketCap');
jest.mock('../../../providers/blockchain');

describe('portfolio service - transfer', () => {
  beforeEach(() => {
    (database as MockDatabase).resetMockValues();
    (blockchain as MockBlockchain).resetMockValues();
  });

  interface Transfer {
    value: number;
    portfolio: Portfolio;
    origin: Asset;
    destiny: Asset;
  }

  const transfers: Transfer[] = [
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

      if (destiny.class === 'crypto') {
        if (destiny.name === 'hodl') {
          (binance as MockBinance).simulateBRLDeposit(value);
        }
        if (destiny.name === 'backed') {
          (mercadoBitcoin as MockMercadoBitcoin).simulateBRLDeposit(value);
        }
      }

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
    }
  );

  it('register a transfer to Binance HODL after the real trasfer was done', async () => {
    const value = 124.67;
    const portfolio = 'financiamento';
    const origin: Asset = { class: 'fixed', name: 'nubank' };
    const destiny: Asset = { class: 'crypto', name: 'hodl' };

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

    (binance as MockBinance).simulateBRLDeposit(value);

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
    expect(newPortfolioOriginValue).toBe(currentPortfolioOriginValue - value);
    expect(newPortfolioDestinyValue).toBe(currentPortfolioDestinyValue + value);
  });

  it('register a transfer to Binance buffer from defi after the real trasfer was done', async () => {
    const assetName = 'BUSD';
    const amount = 100;
    const portfolio = 'amortecedor';
    const origin: Asset = { class: 'crypto', name: 'defi' };
    const destiny: Asset = { class: 'crypto', name: 'binanceBuffer' };

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

    (blockchain as MockBlockchain).simulateDeposit(
      '0x48sdfivn02hcbvrpal8765awbc45333mn46dfdsn',
      assetName,
      -amount
    );
    (binance as MockBinance).simulateDeposit(assetName, amount);

    const value =
      amount * (await coinMarketCap.getSymbolPrice(assetName, 'bsc'));

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

  it('does not transfer when there is no funds available', async () => {
    const value = 10000;
    const portfolio = 'financiamento';
    const origin: Asset = { class: 'fixed', name: 'nubank' };
    const destiny: Asset = { class: 'crypto', name: 'defi' };

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

    // expect(response.status).toBe('notEnoughFunds');
    expect(newPortfolioOriginValue).toBe(currentPortfolioOriginValue);
    expect(newPortfolioDestinyValue).toBe(currentPortfolioDestinyValue);
  });

  // TODO test case should be typesafe and might not be needed
  it('transfer funds to an asset without shares definition', async () => {
    const value = 100;
    const portfolio = 'financiamento';
    const origin: Asset = { class: 'fixed', name: 'nubank' };
    const destiny: Asset = {
      class: 'fixed',
      name: 'poupancaBamerindus' as FixedAsset,
    };

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
    const origin: Asset = { class: 'fixed', name: 'nubank' };
    const destiny: Asset = { class: 'fixed', name: 'iti' };

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
    expect(newPortfolioOriginValue).toBe(0);
    expect(newPortfolioDestinyValue).toBe(
      currentPortfolioDestinyValue + currentPortfolioOriginValue
    );
  });

  it('transfer all funds from an asset', async () => {
    const value = 'all';
    const portfolio = 'financiamento';
    const origin: Asset = { class: 'fixed', name: '99pay' };
    const destiny: Asset = { class: 'fixed', name: 'iti' };

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
    expect(newPortfolioOriginValue).toBe(0);
    expect(newPortfolioDestinyValue).toBe(
      currentPortfolioDestinyValue + currentPortfolioOriginValue
    );
  });
});
