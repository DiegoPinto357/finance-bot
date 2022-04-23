import portfolio from './portfolio';

jest.mock('../providers/googleSheets');
jest.mock('../providers/tradingView');
jest.mock('../providers/binance');
jest.mock('../providers/coinMarketCap');
jest.mock('../providers/blockchain');

describe('portfolio service', () => {
  describe('getBalance', () => {
    it('gets the balance for portfolio "previdencia"', async () => {
      const balance = await portfolio.getBalance('previdencia');
      expect(balance).toEqual({
        balance: {
          crypto: [
            { asset: 'hodl', value: 1434.671471380134 },
            { asset: 'defi', value: 626.706709661356 },
          ],
          fixed: [
            { asset: 'nubank', value: 1295.807356032464 },
            { asset: 'nuInvestCDB12_5', value: 1128.63 },
            { asset: 'nuInvestCBDIPCA5_5', value: 1128.9 },
            { asset: 'nuInvestTDIPCA2035', value: 1489.11 },
          ],
          stock: [
            { asset: 'br', value: 3935.519970999999 },
            { asset: 'us', value: 5407.97 },
            { asset: 'fii', value: 4550.180026999999 },
          ],
        },
        total: 20997.49553507395,
      });
    });

    it('gets the balance for portfolio "temp"', async () => {
      const balance = await portfolio.getBalance('temp');
      expect(balance).toEqual({
        balance: {
          crypto: [],
          fixed: [],
          stock: [],
        },
        total: 0,
      });
    });
  });
});
