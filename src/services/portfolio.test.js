import portfolioService from './portfolio';

jest.mock('../providers/googleSheets');
jest.mock('../providers/tradingView');
jest.mock('../providers/binance');
jest.mock('../providers/coinMarketCap');
jest.mock('../providers/blockchain');

const getAssetValueFromBalance = (balance, assetClass, assetName) =>
  balance.balance[assetClass].find(item => item.asset === assetName).value;

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
    ];

    it.each(deposits)(
      'deposits $depositValue on $portfolioName ($assetClass/$assetName) - also checks $sidePortfolioName',
      async () => {
        const depositValue = 1000;
        const portfolioName = 'suricat';
        const assetClass = 'fixed';
        const assetName = 'nubank';
        const sidePortfolioName = 'congelamentoSuricats';

        const currentBalance = await portfolioService.getBalance(portfolioName);
        const currentAssetValue = getAssetValeuFromBalance(
          currentBalance,
          assetClass,
          assetName
        );

        const curentSideBalance = await portfolioService.getBalance(
          sidePortfolioName
        );

        await portfolioService.deposit({
          value: depositValue,
          portfolio: portfolioName,
          assetClass,
          assetName,
        });

        const newBalance = await portfolioService.getBalance(portfolioName);
        const newAssetValue = getAssetValeuFromBalance(
          newBalance,
          assetClass,
          assetName
        );

        const newSideBalance = await portfolioService.getBalance(
          sidePortfolioName
        );

        expect(newAssetValue).toBe(currentAssetValue + depositValue);
        expect(newSideBalance).toEqual(curentSideBalance);
      }
    );
  });
});
