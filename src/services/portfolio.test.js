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
              { asset: 'defi', value: 626.706709661356 },
            ],
            total: 1434.671471380134 + 626.706709661356,
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
        total: 20997.49553507395,
      });
    });

    it('gets the balance for portfolio "suricat"', async () => {
      const balance = await portfolioService.getBalance('suricat');
      expect(balance).toEqual({
        balance: {
          crypto: {
            balance: [
              { asset: 'hodl', value: 244.33867596477316 },
              { asset: 'defi', value: 252.12802232899193 },
            ],
            total: 244.33867596477316 + 252.12802232899193,
          },
          fixed: {
            balance: [{ asset: 'nubank', value: 4370.80325478285 }],
            total: 4370.80325478285,
          },
          stock: { balance: [], total: 0 },
        },
        total: 4867.269953076615,
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
            currentShare: 0.21670108320296752,
            diffBRL: 69.2689907162694,
          },
          {
            assetClass: 'stock',
            asset: 'br',
            value: 3935.519970999999,
            targetShare: 0.19,
            currentShare: 0.18742806561983338,
            diffBRL: 54.004180664052,
          },
          {
            assetClass: 'stock',
            asset: 'us',
            value: 5407.97,
            targetShare: 0.26,
            currentShare: 0.25755309679511995,
            diffBRL: 51.37883911922745,
          },
          {
            assetClass: 'crypto',
            asset: 'hodl',
            value: 1434.671471380134,
            targetShare: 0.07,
            currentShare: 0.06832583766876754,
            diffBRL: 35.153216075042565,
          },
          {
            assetClass: 'crypto',
            asset: 'defi',
            value: 626.706709661356,
            targetShare: 0.03,
            currentShare: 0.029846736179298762,
            diffBRL: 3.218156390862532,
          },
          {
            assetClass: 'fixed',
            asset: 'fixed',
            value: 5042.447356032464,
            targetShare: 0.23,
            currentShare: 0.2401451805340129,
            diffBRL: -213.0233829654553,
          },
        ],
        total: 20997.49553507395,
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
