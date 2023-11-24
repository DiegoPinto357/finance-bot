import backed from './backed';
import mercadoBitcoin from '../../../providers/mercadoBitcoin';
import database from '../../../providers/database';
import expectedBalance from '../../../../mockData/crypto/backed/expectedBalance.json';

type MockDatabase = typeof database & { resetMockValues: () => void };

jest.mock('../../../providers/database');
jest.mock('../../../providers/mercadoBitcoin');

describe('crypto backed tokens service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (database as MockDatabase).resetMockValues();
  });

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

    it('gets total position of given asset', async () => {
      const asset = 'BRL';
      const totalPosition = await backed.getTotalPosition(asset);
      expect(totalPosition).toEqual(
        expectedBalance.balance.find(item => item.asset === asset)?.positionBRL
      );
    });
  });
});
