import defi2 from '../defi2';
import expectedBalance from '../../../../../mockData/crypto/defi2/expectedBalance.json';

jest.mock('../../../../providers/googleSheets');
jest.mock('../../../../providers/database');
jest.mock('../../../../providers/tradingView');
jest.mock('../../../../providers/blockchain');
jest.mock('../../../../providers/coinMarketCap');

describe('crypto defi2 service', () => {
  describe('getBalance', () => {
    it('gets defi2 balance', async () => {
      const balance = await defi2.getBalance();
      expect(balance).toEqual(expectedBalance);
    });
  });
});
