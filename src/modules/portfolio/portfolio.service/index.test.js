import googleSheets from '../../../providers/googleSheets';
import database from '../../../providers/database';
import binance from '../../../providers/binance';
import fixedService from '../../fixed/fixed.service';
import stockService from '../../stock/stock.service';
import cryptoService from '../../crypto/crypto.service';
import portfolioService from '.';

jest.mock('../../../providers/googleSheets');
jest.mock('../../../providers/database');
jest.mock('../../../providers/tradingView');
jest.mock('../../../providers/binance');
jest.mock('../../../providers/mercadoBitcoin');
jest.mock('../../../providers/coinMarketCap');
jest.mock('../../../providers/blockchain');

const services = {
  fixed: fixedService,
  stock: stockService,
  crypto: cryptoService,
};

const getAssetValueFromBalance = ({ balance }, assetClass, assetName) => {
  const assetBalance = balance[assetClass].balance.find(
    item => item.asset === assetName
  );
  return assetBalance ? assetBalance.value : 0;
};

describe('portfolio service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    database.resetMockValues();
  });

  describe('deposit', () => {
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

        const currentPortfolioBalance = await portfolioService.getBalance(
          portfolioName
        );
        const currentPortfolioAssetValue = getAssetValueFromBalance(
          currentPortfolioBalance,
          assetClass,
          assetName
        );

        const curentSidePortfolioBalance = sidePortfolioName
          ? await portfolioService.getBalance(sidePortfolioName)
          : null;

        const service = services[assetClass];
        const currentTotalAssetValue = await service.getTotalPosition(
          assetName
        );

        const result = await portfolioService.deposit({
          value: depositValue,
          portfolio: portfolioName,
          assetClass,
          assetName,
        });

        if (assetClass === 'crypto') {
          await binance.simulateBRLDeposit(depositValue);
        }

        const newPortfolioBalance = await portfolioService.getBalance(
          portfolioName
        );
        const newPortfolioAssetValue = getAssetValueFromBalance(
          newPortfolioBalance,
          assetClass,
          assetName
        );

        const newSidePortfolioBalance = sidePortfolioName
          ? await portfolioService.getBalance(sidePortfolioName)
          : null;

        const newTotalAssetValue = await service.getTotalPosition(assetName);

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

      const currentPortfolioBalance = await portfolioService.getBalance(
        portfolioName
      );
      const currentPortfolioAssetValue = getAssetValueFromBalance(
        currentPortfolioBalance,
        assetClass,
        assetName
      );

      const curentSidePortfolioBalance = sidePortfolioName
        ? await portfolioService.getBalance(sidePortfolioName)
        : null;

      const currentTotalAssetValue = await cryptoService.getTotalPosition(
        assetName
      );

      await binance.simulateBRLDeposit(depositValue);

      const result = await portfolioService.deposit({
        value: depositValue,
        portfolio: portfolioName,
        assetClass,
        assetName,
        executed: true,
      });

      const newPortfolioBalance = await portfolioService.getBalance(
        portfolioName
      );
      const newPortfolioAssetValue = getAssetValueFromBalance(
        newPortfolioBalance,
        assetClass,
        assetName
      );

      const newSidePortfolioBalance = sidePortfolioName
        ? await portfolioService.getBalance(sidePortfolioName)
        : null;

      const newTotalAssetValue = await cryptoService.getTotalPosition(
        assetName
      );

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

      const currentBalance = await portfolioService.getBalance(portfolioName);
      const currentAssetValue = getAssetValueFromBalance(
        currentBalance,
        assetClass,
        assetName
      );

      const result = await portfolioService.deposit({
        value: depositValue,
        portfolio: portfolioName,
        assetClass,
        assetName,
      });

      const newBalance = await portfolioService.getBalance(portfolioName);
      const newAssetValue = getAssetValueFromBalance(
        newBalance,
        assetClass,
        assetName
      );

      expect(result.status).toBe('notEnoughFunds');
      expect(newAssetValue).toBe(currentAssetValue);
    });
  });

  describe('transfer', () => {
    beforeEach(() => googleSheets.resetMockValues());

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
        const currentPortfolioBalance = await portfolioService.getBalance(
          portfolio
        );

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

        const response = await portfolioService.transfer({
          value,
          portfolio,
          origin,
          destiny,
        });

        if (destiny.class === 'crypto') {
          await binance.simulateBRLDeposit(value);
        }

        const newPortfolioBalance = await portfolioService.getBalance(
          portfolio
        );

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

      const currentPortfolioBalance = await portfolioService.getBalance(
        portfolio
      );

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

      const response = await portfolioService.transfer({
        value,
        portfolio,
        origin,
        destiny,
        destinyExecuted: true,
      });

      const newPortfolioBalance = await portfolioService.getBalance(portfolio);

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
      expect(newPortfolioDestinyValue).toBe(
        currentPortfolioDestinyValue + value
      );
    });

    it('does not transfer when there is no funds available', async () => {
      const value = 10000;
      const portfolio = 'financiamento';
      const origin = { class: 'fixed', name: 'nubank' };
      const destiny = { class: 'crypto', name: 'defi' };

      const response = await portfolioService.transfer({
        value,
        portfolio,
        origin,
        destiny,
      });

      const portfolioBalance = await portfolioService.getBalance(portfolio);

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

      const currentPortfolioBalance = await portfolioService.getBalance(
        portfolio
      );

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

      const response = await portfolioService.transfer({
        value,
        portfolio,
        origin,
        destiny,
      });

      const newPortfolioBalance = await portfolioService.getBalance(portfolio);

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

      const currentPortfolioBalance = await portfolioService.getBalance(
        portfolio
      );

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

      const response = await portfolioService.transfer({
        value,
        portfolio,
        origin,
        destiny,
      });

      if (destiny.class === 'crypto') {
        await binance.simulateBRLDeposit(value);
      }

      const newPortfolioBalance = await portfolioService.getBalance(portfolio);

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

      const currentPortfolioBalance = await portfolioService.getBalance(
        portfolio
      );

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

      const response = await portfolioService.transfer({
        value,
        portfolio,
        origin,
        destiny,
      });

      if (destiny.class === 'crypto') {
        await binance.simulateBRLDeposit(value);
      }

      const newPortfolioBalance = await portfolioService.getBalance(portfolio);

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

  describe('swap', () => {
    beforeEach(() => googleSheets.resetMockValues());

    it('swap funds within same portfolio', async () => {
      const value = 100;
      const portfolio = 'financiamento';
      const origin = { class: 'fixed', name: 'nubank' };
      const destiny = { class: 'fixed', name: 'pagBankCDB120' };
      const liquidity = 'amortecedor';

      const [currentPortfolioBalance, currentLiquidityBalance] =
        await Promise.all([
          portfolioService.getBalance(portfolio),
          portfolioService.getBalance(liquidity),
        ]);

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

      const currentLiquidityOriginValue = getAssetValueFromBalance(
        currentLiquidityBalance,
        origin.class,
        origin.name
      );

      const currentLiquidityDestinyValue = getAssetValueFromBalance(
        currentLiquidityBalance,
        destiny.class,
        destiny.name
      );

      const response = await portfolioService.swap({
        value,
        portfolio,
        origin,
        destiny,
        liquidity,
      });

      const [newPortfolioBalance, newLiquidityBalance] = await Promise.all([
        portfolioService.getBalance(portfolio),
        portfolioService.getBalance(liquidity),
      ]);

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

      const newLiquidityOriginValue = getAssetValueFromBalance(
        newLiquidityBalance,
        origin.class,
        origin.name
      );

      const newLiquidityDestinyValue = getAssetValueFromBalance(
        newLiquidityBalance,
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
      expect(newLiquidityOriginValue).toBeCloseTo(
        currentLiquidityOriginValue + value,
        5
      );
      expect(newLiquidityDestinyValue).toBeCloseTo(
        currentLiquidityDestinyValue - value,
        5
      );
    });

    it('swap funds when asset shares  misses origin portfolio info', async () => {
      const value = 100;
      const portfolio = 'previdencia';
      const origin = { class: 'fixed', name: 'nubank' };
      const destiny = { class: 'fixed', name: 'pagBankCDB120' };
      const liquidity = 'amortecedor';

      const [currentPortfolioBalance, currentLiquidityBalance] =
        await Promise.all([
          portfolioService.getBalance(portfolio),
          portfolioService.getBalance(liquidity),
        ]);

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

      const currentLiquidityOriginValue = getAssetValueFromBalance(
        currentLiquidityBalance,
        origin.class,
        origin.name
      );

      const currentLiquidityDestinyValue = getAssetValueFromBalance(
        currentLiquidityBalance,
        destiny.class,
        destiny.name
      );

      const response = await portfolioService.swap({
        value,
        portfolio,
        origin,
        destiny,
        liquidity,
      });

      const [newPortfolioBalance, newLiquidityBalance] = await Promise.all([
        portfolioService.getBalance(portfolio),
        portfolioService.getBalance(liquidity),
      ]);

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

      const newLiquidityOriginValue = getAssetValueFromBalance(
        newLiquidityBalance,
        origin.class,
        origin.name
      );

      const newLiquidityDestinyValue = getAssetValueFromBalance(
        newLiquidityBalance,
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
      expect(newLiquidityOriginValue).toBeCloseTo(
        currentLiquidityOriginValue + value,
        5
      );
      expect(newLiquidityDestinyValue).toBeCloseTo(
        currentLiquidityDestinyValue - value,
        5
      );
    });

    it('swap funds when asset shares misses destiny portfolio info', async () => {
      const value = -100;
      const portfolio = 'previdencia';
      const origin = { class: 'fixed', name: 'pagBankCDB120' };
      const destiny = { class: 'fixed', name: 'nubank' };
      const liquidity = 'amortecedor';

      const [currentPortfolioBalance, currentLiquidityBalance] =
        await Promise.all([
          portfolioService.getBalance(portfolio),
          portfolioService.getBalance(liquidity),
        ]);

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

      const currentLiquidityOriginValue = getAssetValueFromBalance(
        currentLiquidityBalance,
        origin.class,
        origin.name
      );

      const currentLiquidityDestinyValue = getAssetValueFromBalance(
        currentLiquidityBalance,
        destiny.class,
        destiny.name
      );

      const response = await portfolioService.swap({
        value,
        portfolio,
        origin,
        destiny,
        liquidity,
      });

      const [newPortfolioBalance, newLiquidityBalance] = await Promise.all([
        portfolioService.getBalance(portfolio),
        portfolioService.getBalance(liquidity),
      ]);

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

      const newLiquidityOriginValue = getAssetValueFromBalance(
        newLiquidityBalance,
        origin.class,
        origin.name
      );

      const newLiquidityDestinyValue = getAssetValueFromBalance(
        newLiquidityBalance,
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
      expect(newLiquidityOriginValue).toBeCloseTo(
        currentLiquidityOriginValue + value,
        5
      );
      expect(newLiquidityDestinyValue).toBeCloseTo(
        currentLiquidityDestinyValue - value,
        5
      );
    });

    it('swap funds within same asset', async () => {
      const value = 100;
      const asset = { class: 'fixed', name: 'pagBankCDB120' };
      const origin = 'amortecedor';
      const destiny = 'suricat';
      const liquidity = { class: 'fixed', name: 'nubank' };

      const [currentOriginBalance, currentDestinyBalance] = await Promise.all([
        portfolioService.getBalance(origin),
        portfolioService.getBalance(destiny),
      ]);

      const currentPortfolioOriginValue = getAssetValueFromBalance(
        currentOriginBalance,
        asset.class,
        asset.name
      );

      const currentPortfolioDestinyValue = getAssetValueFromBalance(
        currentDestinyBalance,
        asset.class,
        asset.name
      );

      const currentLiquidityOriginValue = getAssetValueFromBalance(
        currentOriginBalance,
        liquidity.class,
        liquidity.name
      );

      const currentLiquidityDestinyValue = getAssetValueFromBalance(
        currentDestinyBalance,
        liquidity.class,
        liquidity.name
      );

      const response = await portfolioService.swap({
        value,
        asset,
        origin,
        destiny,
        liquidity,
      });

      const [newOriginBalance, newDestinyBalance] = await Promise.all([
        portfolioService.getBalance(origin),
        portfolioService.getBalance(destiny),
      ]);

      const newPortfolioOriginValue = getAssetValueFromBalance(
        newOriginBalance,
        asset.class,
        asset.name
      );

      const newPortfolioDestinyValue = getAssetValueFromBalance(
        newDestinyBalance,
        asset.class,
        asset.name
      );

      const newLiquidityOriginValue = getAssetValueFromBalance(
        newOriginBalance,
        liquidity.class,
        liquidity.name
      );

      const newLiquidityDestinyValue = getAssetValueFromBalance(
        newDestinyBalance,
        liquidity.class,
        liquidity.name
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
      expect(newLiquidityOriginValue).toBeCloseTo(
        currentLiquidityOriginValue + value,
        5
      );
      expect(newLiquidityDestinyValue).toBeCloseTo(
        currentLiquidityDestinyValue - value,
        5
      );
    });

    it('swaps all funds within same portfolio', async () => {
      const value = 'all';
      const portfolio = 'impostos';
      const origin = { class: 'crypto', name: 'hodl' };
      const destiny = { class: 'fixed', name: 'nubank' };
      const liquidity = 'amortecedor';

      const [currentPortfolioBalance, currentLiquidityBalance] =
        await Promise.all([
          portfolioService.getBalance(portfolio),
          portfolioService.getBalance(liquidity),
        ]);

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

      const currentLiquidityOriginValue = getAssetValueFromBalance(
        currentLiquidityBalance,
        origin.class,
        origin.name
      );

      const currentLiquidityDestinyValue = getAssetValueFromBalance(
        currentLiquidityBalance,
        destiny.class,
        destiny.name
      );

      const response = await portfolioService.swap({
        value,
        portfolio,
        origin,
        destiny,
        liquidity,
      });

      const [newPortfolioBalance, newLiquidityBalance] = await Promise.all([
        portfolioService.getBalance(portfolio),
        portfolioService.getBalance(liquidity),
      ]);

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

      const newLiquidityOriginValue = getAssetValueFromBalance(
        newLiquidityBalance,
        origin.class,
        origin.name
      );

      const newLiquidityDestinyValue = getAssetValueFromBalance(
        newLiquidityBalance,
        destiny.class,
        destiny.name
      );

      expect(response.status).toBe('ok');
      expect(newPortfolioOriginValue).toBe(0);
      expect(newPortfolioDestinyValue).toBe(
        currentPortfolioDestinyValue + currentPortfolioOriginValue
      );
      expect(newLiquidityOriginValue).toBe(
        currentLiquidityOriginValue + currentPortfolioOriginValue
      );
      expect(newLiquidityDestinyValue).toBe(
        currentLiquidityDestinyValue - currentPortfolioOriginValue
      );
    });

    describe('no liquidity available', () => {
      it('does not swap funds within same portfolio', async () => {
        const value = 10000;
        const portfolio = 'financiamento';
        const origin = { class: 'fixed', name: 'nubank' };
        const destiny = { class: 'crypto', name: 'defi' };
        const liquidity = 'amortecedor';

        const [currentOriginBalance, currentDestinyBalance] = await Promise.all(
          [
            portfolioService.getBalance(portfolio),
            portfolioService.getBalance(liquidity),
          ]
        );

        const currentPortfolioOriginValue = getAssetValueFromBalance(
          currentOriginBalance,
          origin.class,
          origin.name
        );

        const currentPortfolioDestinyValue = getAssetValueFromBalance(
          currentDestinyBalance,
          destiny.class,
          destiny.name
        );

        const currentLiquidityOriginValue = getAssetValueFromBalance(
          currentOriginBalance,
          origin.class,
          origin.name
        );

        const currentLiquidityDestinyValue = getAssetValueFromBalance(
          currentDestinyBalance,
          destiny.class,
          destiny.name
        );

        const response = await portfolioService.swap({
          value,
          portfolio,
          origin,
          destiny,
          liquidity,
        });

        const [newOriginBalance, newDestinyBalance] = await Promise.all([
          portfolioService.getBalance(portfolio),
          portfolioService.getBalance(liquidity),
        ]);

        const newPortfolioOriginValue = getAssetValueFromBalance(
          newOriginBalance,
          origin.class,
          origin.name
        );

        const newPortfolioDestinyValue = getAssetValueFromBalance(
          newDestinyBalance,
          destiny.class,
          destiny.name
        );

        const newLiquidityOriginValue = getAssetValueFromBalance(
          newOriginBalance,
          origin.class,
          origin.name
        );

        const newLiquidityDestinyValue = getAssetValueFromBalance(
          newDestinyBalance,
          destiny.class,
          destiny.name
        );

        expect(response.status).toBe('notEnoughFunds');
        expect(newPortfolioOriginValue).toBe(currentPortfolioOriginValue);
        expect(newPortfolioDestinyValue).toBe(currentPortfolioDestinyValue);
        expect(newLiquidityOriginValue).toBe(currentLiquidityOriginValue);
        expect(newLiquidityDestinyValue).toBe(currentLiquidityDestinyValue);
      });

      it('does not swap funds within same asset', async () => {
        const value = 10000;
        const asset = { class: 'crypto', name: 'hodl' };
        const origin = 'amortecedor';
        const destiny = 'suricat';
        const liquidity = { class: 'fixed', name: 'nubank' };

        const [currentOriginBalance, currentDestinyBalance] = await Promise.all(
          [
            portfolioService.getBalance(origin),
            portfolioService.getBalance(destiny),
          ]
        );

        const currentPortfolioOriginValue = getAssetValueFromBalance(
          currentOriginBalance,
          asset.class,
          asset.name
        );

        const currentPortfolioDestinyValue = getAssetValueFromBalance(
          currentDestinyBalance,
          asset.class,
          asset.name
        );

        const currentLiquidityOriginValue = getAssetValueFromBalance(
          currentOriginBalance,
          liquidity.class,
          liquidity.name
        );

        const currentLiquidityDestinyValue = getAssetValueFromBalance(
          currentDestinyBalance,
          liquidity.class,
          liquidity.name
        );

        const response = await portfolioService.swap({
          value,
          asset,
          origin,
          destiny,
          liquidity,
        });

        const [newOriginBalance, newDestinyBalance] = await Promise.all([
          portfolioService.getBalance(origin),
          portfolioService.getBalance(destiny),
        ]);

        const newPortfolioOriginValue = getAssetValueFromBalance(
          newOriginBalance,
          asset.class,
          asset.name
        );

        const newPortfolioDestinyValue = getAssetValueFromBalance(
          newDestinyBalance,
          asset.class,
          asset.name
        );

        const newLiquidityOriginValue = getAssetValueFromBalance(
          newOriginBalance,
          liquidity.class,
          liquidity.name
        );

        const newLiquidityDestinyValue = getAssetValueFromBalance(
          newDestinyBalance,
          liquidity.class,
          liquidity.name
        );

        expect(response.status).toBe('notEnoughFunds');
        expect(newPortfolioOriginValue).toBe(currentPortfolioOriginValue);
        expect(newPortfolioDestinyValue).toBe(currentPortfolioDestinyValue);
        expect(newLiquidityOriginValue).toBe(currentLiquidityOriginValue);
        expect(newLiquidityDestinyValue).toBe(currentLiquidityDestinyValue);
      });
    });
  });

  describe('getAssets', () => {
    it('returns list of assets', async () => {
      const assets = await portfolioService.getAssets();
      expect(assets).toEqual([
        { assetClass: 'fixed', assetName: 'nubank' },
        { assetClass: 'fixed', assetName: '99pay' },
        { assetClass: 'fixed', assetName: 'pagBankCDB120' },
        { assetClass: 'fixed', assetName: 'xpWesternAsset' },
        { assetClass: 'fixed', assetName: 'daycovalCDB110' },
        { assetClass: 'fixed', assetName: 'daycovalCDBCDI1_2' },
        { assetClass: 'fixed', assetName: 'nuInvestCDB8_5' },
        { assetClass: 'fixed', assetName: 'nuInvestCDB9_5' },
        { assetClass: 'fixed', assetName: 'nuInvestCBDIPCA5_5' },
        { assetClass: 'fixed', assetName: 'nuInvestCDB12_5' },
        { assetClass: 'fixed', assetName: 'nuInvestTDIPCA2035' },
        { assetClass: 'stock', assetName: 'br' },
        { assetClass: 'stock', assetName: 'fii' },
        { assetClass: 'stock', assetName: 'us' },
        { assetClass: 'stock', assetName: 'float' },
        { assetClass: 'crypto', assetName: 'binanceBuffer' },
        { assetClass: 'crypto', assetName: 'hodl' },
        { assetClass: 'crypto', assetName: 'defi' },
        { assetClass: 'crypto', assetName: 'defi2' },
        { assetClass: 'crypto', assetName: 'anchor' },
        { assetClass: 'crypto', assetName: 'backed' },
      ]);
    });

    describe('removeAsset', () => {
      it('removes a fixed asset with no funds', async () => {
        const assetClass = 'fixed';
        const assetName = 'nubank';
        await database.updateOne(
          'assets',
          'fixed',
          { asset: assetName },
          { $set: { value: 0 } }
        );

        const databaseDeleteOneSpy = jest.spyOn(database, 'deleteOne');

        const { status } = await portfolioService.removeAsset({
          assetClass,
          assetName,
        });

        const remainingAssets = await portfolioService.getAssets();

        expect(status).toBe('ok');
        expect(remainingAssets).not.toContain(assetName);
        expect(databaseDeleteOneSpy).toBeCalledWith('portfolio', 'shares', {
          assetClass,
          assetName,
        });
      });

      it('does not remove a fixed asset if it still have funds', async () => {
        const assetClass = 'fixed';
        const assetName = 'nubank';

        const databaseDeleteOneSpy = jest.spyOn(database, 'deleteOne');

        const { status } = await portfolioService.removeAsset({
          assetClass,
          assetName,
        });

        const remainingAssets = await portfolioService.getAssets();

        expect(status).toBe('assetHasFunds');
        expect(remainingAssets).not.toContain(assetName);
        expect(databaseDeleteOneSpy).not.toBeCalledWith('portfolio', 'shares', {
          assetClass,
          assetName,
        });
      });
    });
  });
});
