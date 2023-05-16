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

    it('gets total position of given asset', async () => {
      const asset = 'BRL';
      const totalPosition = await backed.getTotalPosition(asset);
      expect(totalPosition).toEqual(
        expectedBalance.balance.find(item => item.asset === asset).positionBRL
      );
    });
  });

  describe('deposit', () => {
    it('deposits value on BRL', async () => {
      const value = 150;
      const asset = 'BRL';
      const currentBRLValue = await backed.getTotalPosition(asset);

      const result = await backed.deposit({ asset, value });

      const newBRLValue = await backed.getTotalPosition(asset);

      expect(result).toEqual({ status: 'ok' });
      expect(newBRLValue).toBe(currentBRLValue + value);
    });

    it('deposits value on BRL by default when asset is not provided', async () => {
      const value = 150;
      const asset = 'BRL';
      const currentBRLValue = await backed.getTotalPosition(asset);

      const result = await backed.deposit({ value });

      const newBRLValue = await backed.getTotalPosition(asset);

      expect(result).toEqual({ status: 'ok' });
      expect(newBRLValue).toBe(currentBRLValue + value);
    });

    it('does not "withdrawn" value whe funds are not available', async () => {
      const value = 5000;
      const asset = 'BRL';
      const currentBRLValue = await backed.getTotalPosition(asset);

      const result = await backed.deposit({ asset, value: -value });

      const newBRLValue = await backed.getTotalPosition(asset);

      expect(result).toEqual({ status: 'notEnoughFunds' });
      expect(newBRLValue).toBe(currentBRLValue);
    });
  });
});
