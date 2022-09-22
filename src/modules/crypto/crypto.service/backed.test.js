import backed from './backed';
import expectedBalance from '../../../../mockData/crypto/backed/expectedBalance.json';

jest.mock('../../../providers/database');
jest.mock('../../../providers/mercadoBitcoin');

describe('crypto backed tokens service', () => {
  describe('getBalance', () => {
    it('gets backed tokens balance', async () => {
      const balance = await backed.getBalance();
      expect(balance).toEqual(expectedBalance);
    });
  });

  describe('getTotalPosition', () => {
    it('gets backed tokens total position', async () => {
      const totalPosition = await backed.getTotalPosition();
      expect(totalPosition).toEqual(expectedBalance.total);
    });
  });
});
