import googleSheets from '../../providers/googleSheets';
import database from '../../providers/database';
import binance from '../../providers/binance';
import fixedService from '../fixed/fixed.service';
import stockService from '../stock/stock.service';
import cryptoService from '../crypto/crypto.service';
import portfolioService from './portfolio.service';

jest.mock('../../providers/googleSheets');
jest.mock('../../providers/database');
jest.mock('../../providers/tradingView');
jest.mock('../../providers/binance');
jest.mock('../../providers/mercadoBitcoin');
jest.mock('../../providers/coinMarketCap');
jest.mock('../../providers/blockchain');

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

  describe('getBalance', () => {
    it('gets the balance for portfolio "previdencia"', async () => {
      const balance = await portfolioService.getBalance('previdencia');

      expect(balance).toEqual({
        balance: {
          crypto: {
            balance: [
              { asset: 'hodl', value: 1434.671471380134 },
              { asset: 'defi', value: 609.1621219710817 },
            ],
            total: 1434.671471380134 + 609.1621219710817,
          },
          fixed: {
            balance: [
              { asset: 'nubank', value: 1295.807356032464 },
              { asset: 'nuInvestCDB12_5', value: 1128.63 },
              { asset: 'nuInvestCBDIPCA5_5', value: 1128.9 },
              { asset: 'nuInvestTDIPCA2035', value: 1489.11 },
            ],
            total: 1295.807356032464 + 1128.63 + 1128.9 + 1489.11,
          },
          stock: {
            balance: [
              { asset: 'br', value: 3935.519970999999 },
              { asset: 'us', value: 5407.97 },
              { asset: 'fii', value: 4550.180026999999 },
              { asset: 'float', value: 154.059917105392 },
            ],
            total:
              3935.519970999999 +
              5407.97 +
              4550.180026999999 +
              154.059917105392,
          },
        },
        total: 21134.01086448907,
      });
    });

    it('gets the balance for portfolio "suricat"', async () => {
      const balance = await portfolioService.getBalance('suricat');

      expect(balance).toEqual({
        balance: {
          crypto: {
            balance: [
              { asset: 'hodl', value: 244.33867596477316 },
              { asset: 'defi', value: 245.06972515627345 },
            ],
            total: 244.33867596477316 + 245.06972515627345,
          },
          fixed: {
            balance: [
              { asset: 'nubank', value: 4370.80325478285 },
              { asset: 'pagBankCDB120', value: 406.70591249473637 },
            ],
            total: 4777.509167277586,
          },
          stock: { balance: [], total: 0 },
        },
        total: 5266.917568398632,
      });
    });

    it('gets the balance for portfolio "temp"', async () => {
      const balance = await portfolioService.getBalance('temp');

      expect(balance).toEqual({
        balance: {
          crypto: { balance: [], total: 0 },
          fixed: { balance: [], total: 0 },
          stock: { balance: [], total: 0 },
        },
        total: 0,
      });
    });

    it('gets the balance of all portfolios when no portfolio name is provided', async () => {
      const balance = await portfolioService.getBalance();

      const expectedBalance = expect.objectContaining({
        balance: {
          crypto: { balance: expect.any(Array), total: expect.any(Number) },
          fixed: { balance: expect.any(Array), total: expect.any(Number) },
          stock: { balance: expect.any(Array), total: expect.any(Number) },
        },
        total: expect.any(Number),
      });

      expect(balance).toEqual({
        balance: {
          temp: expectedBalance,
          amortecedor: expectedBalance,
          financiamento: expectedBalance,
          viagem: expectedBalance,
          reformaCasa: expectedBalance,
          previdencia: expectedBalance,
          leni: expectedBalance,
          mae: expectedBalance,
          seguroCarro: expectedBalance,
          manutencaoCarro: expectedBalance,
          impostos: expectedBalance,
          suricat: expectedBalance,
          congelamentoSuricats: expectedBalance,
          carro: expectedBalance,
          rendaPassiva: expectedBalance,
        },
        total: expect.any(Number),
      });
    });

    it('gets the balance of a list of portfolio names', async () => {
      const balance = await portfolioService.getBalance([
        'amortecedor',
        'suricat',
      ]);

      const expectedBalance = expect.objectContaining({
        balance: {
          crypto: { balance: expect.any(Array), total: expect.any(Number) },
          fixed: { balance: expect.any(Array), total: expect.any(Number) },
          stock: { balance: expect.any(Array), total: expect.any(Number) },
        },
        total: expect.any(Number),
      });

      expect(balance).toEqual({
        balance: {
          amortecedor: expectedBalance,
          suricat: expectedBalance,
        },
        total: expect.any(Number),
      });
    });
  });

  describe('getShares', () => {
    it('gets shares for portfolio "previdencia"', async () => {
      const shares = await portfolioService.getShares('previdencia');

      expect(shares).toEqual({
        shares: [
          {
            assetClass: 'stock',
            asset: 'fii',
            value: 4550.180026999999,
            targetShare: 0.22,
            currentShare: 0.21530130064641675,
            diffBRL: 99.30236318759671,
          },
          {
            assetClass: 'stock',
            asset: 'us',
            value: 5407.97,
            targetShare: 0.26,
            currentShare: 0.2558894302967768,
            diffBRL: 86.87282476715882,
          },
          {
            assetClass: 'stock',
            asset: 'br',
            value: 3935.519970999999,
            targetShare: 0.19,
            currentShare: 0.1862173723783189,
            diffBRL: 79.94209325292468,
          },
          {
            assetClass: 'crypto',
            asset: 'hodl',
            value: 1434.671471380134,
            targetShare: 0.07,
            currentShare: 0.067884486318249,
            diffBRL: 44.70928913410103,
          },
          {
            assetClass: 'crypto',
            asset: 'defi',
            value: 609.1621219710817,
            targetShare: 0.03,
            currentShare: 0.028823782001297298,
            diffBRL: 24.858203963590427,
          },
          {
            assetClass: 'stock',
            asset: 'float',
            value: 154.059917105392,
            targetShare: 0,
            currentShare: 0.007289667734781706,
            diffBRL: -154.059917105392,
          },
          {
            assetClass: 'fixed',
            value: 5042.447356032464,
            targetShare: 0.23,
            currentShare: 0.23859396062415947,
            diffBRL: -181.62485719997767,
          },
        ],
        total: 21134.01086448907,
      });
    });

    it('gets shares for a portfolio without target definition', async () => {
      const shares = await portfolioService.getShares('financiamento');

      expect(shares).toEqual({
        shares: [
          {
            assetClass: 'fixed',
            value: 7078.717302553882,
            targetShare: 0.9,
            currentShare: 0.8189126501241224,
            diffBRL: 700.9226521261035,
          },
          {
            assetClass: 'crypto',
            asset: 'hodl',
            value: 182.51841815850264,
            targetShare: 0.06,
            currentShare: 0.021114932991704173,
            diffBRL: 336.12424548682975,
          },
          {
            assetClass: 'crypto',
            asset: 'defi',
            value: 266.5505693764885,
            targetShare: 0.04,
            currentShare: 0.030836325824375215,
            diffBRL: 79.2112063870664,
          },
          {
            assetClass: 'crypto',
            asset: 'backed',
            value: 1116.258104,
            targetShare: 0,
            currentShare: 0.12913609105979834,
            diffBRL: -1116.258104,
          },
        ],
        total: 8644.044394088873,
      });
    });

    it('sets diffBRL to 0 for portfolio without target share definition', async () => {
      const shares = await portfolioService.getShares('suricat');

      expect(shares).toEqual({
        shares: [
          {
            assetClass: 'crypto',
            asset: 'hodl',
            value: 244.33867596477316,
            targetShare: 0,
            currentShare: 0.0463912094297429,
            diffBRL: 0,
          },
          {
            assetClass: 'crypto',
            asset: 'defi',
            value: 245.06972515627345,
            targetShare: 0,
            currentShare: 0.04653000962587404,
            diffBRL: 0,
          },
          {
            asset: 'pagBankCDB120',
            assetClass: 'fixed',
            value: 406.70591249473637,
            targetShare: 0,
            currentShare: 0.07721896293478395,
            diffBRL: 0,
          },
          {
            asset: 'nubank',
            assetClass: 'fixed',
            value: 4370.80325478285,
            targetShare: 0,
            currentShare: 0.8298598180095992,
            diffBRL: 0,
          },
        ],
        total: 5266.917568398632,
      });
    });

    it('gets shares for all portfolios when portfolioType is not provided', async () => {
      const { shares, total } = await portfolioService.getShares();

      expect(shares).toHaveLength(15);
      expect(shares).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            portfolio: expect.any(String),
            shares: expect.any(Array),
          }),
        ])
      );
      expect(total).toBe(126116.99037688586);
    });
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

    it('swap funds when asset misses origin portfolio info', async () => {
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

    it('swap funds when asset misses destiny portfolio info', async () => {
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
  });

  describe('getPortfolios', () => {
    it('returns list of portfolios', async () => {
      const portfolios = await portfolioService.getPortfolios();
      expect(portfolios).toEqual([
        'temp',
        'amortecedor',
        'financiamento',
        'viagem',
        'reformaCasa',
        'previdencia',
        'leni',
        'mae',
        'seguroCarro',
        'manutencaoCarro',
        'impostos',
        'suricat',
        'congelamentoSuricats',
        'carro',
        'rendaPassiva',
      ]);
    });
  });
});
