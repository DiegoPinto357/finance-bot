const hodl = require('./hodl');
const expectedBalance = require('../../../../mockData/crypto/hodl/expectedBalance.json');

jest.mock('../../../providers/googleSheets');
jest.mock('../../../providers/database');
jest.mock('../../../providers/binance');

describe('crypto hodl service', () => {
  describe('getBalance', () => {
    it('gets HODL balance', async () => {
      const balance = await hodl.getBalance();
      expect(balance).toEqual(expectedBalance);
    });
  });
});
