import defi from '.';
import expectedBalance from '../../../../../mockData/crypto/defi/expectedBalance.json';

jest.mock('../../../../providers/googleSheets');
jest.mock('../../../../providers/database');
jest.mock('../../../../providers/database');
jest.mock('../../../../providers/blockchain');
jest.mock('../../../../providers/coinMarketCap');

describe('crypto defi service', () => {
  describe('getBalance', () => {
    it('gets defi balance', async () => {
      const balance = await defi.getBalance();
      expect(balance).toEqual(expectedBalance);
    });
  });
});
