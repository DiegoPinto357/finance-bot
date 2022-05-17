import portfolioService from './portfolio';

jest.mock('../providers/googleSheets');
jest.mock('../providers/tradingView');
jest.mock('../providers/binance');
jest.mock('../providers/coinMarketCap');
jest.mock('../providers/blockchain');

const getAssetValueFromBalance = ({ balance }, assetClass, assetName) =>
  balance[assetClass].balance.find(item => item.asset === assetName).value;

describe('portfolio service', () => {
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
            ],
            total: 3935.519970999999 + 5407.97 + 4550.180026999999,
          },
        },
        total: 20979.950947383677,
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
            balance: [{ asset: 'nubank', value: 4370.80325478285 }],
            total: 4370.80325478285,
          },
          stock: { balance: [], total: 0 },
        },
        total: 4860.211655903897,
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
            currentShare: 0.21688230055501792,
            diffBRL: 65.40918142440933,
          },
          {
            assetClass: 'stock',
            asset: 'br',
            value: 3935.519970999999,
            targetShare: 0.19,
            currentShare: 0.1875848032662241,
            diffBRL: 50.67070900289991,
          },
          {
            assetClass: 'stock',
            asset: 'us',
            value: 5407.97,
            targetShare: 0.26,
            currentShare: 0.25776847684548115,
            diffBRL: 46.81724631975612,
          },
          {
            assetClass: 'crypto',
            asset: 'hodl',
            value: 1434.671471380134,
            targetShare: 0.07,
            currentShare: 0.06838297548827425,
            diffBRL: 33.925094936723326,
          },
          {
            assetClass: 'crypto',
            asset: 'defi',
            value: 609.1621219710817,
            targetShare: 0.03,
            currentShare: 0.029035440716654665,
            diffBRL: 20.236406450428603,
          },
          {
            assetClass: 'fixed',
            asset: 'fixed',
            value: 5042.447356032464,
            targetShare: 0.23,
            currentShare: 0.24034600312834797,
            diffBRL: -217.0586381342182,
          },
        ],
        total: 20979.950947383677,
      });
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
        assetName: 'br',
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
        const currentBalance = await portfolioService.getBalance(portfolioName);
        const currentAssetValue = getAssetValueFromBalance(
          currentBalance,
          assetClass,
          assetName
        );

        const curentSideBalance = sidePortfolioName
          ? await portfolioService.getBalance(sidePortfolioName)
          : null;

        await portfolioService.deposit({
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

        const newSideBalance = sidePortfolioName
          ? await portfolioService.getBalance(sidePortfolioName)
          : null;

        expect(newAssetValue).toBe(currentAssetValue + depositValue);
        expect(newSideBalance).toEqual(curentSideBalance);
      }
    );
  });
});
