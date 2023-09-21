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

  describe('sell', () => {
    it('registers a sell operation', async () => {
      const asset = 'MBCCSH06';
      const sellAmount = 0.75;
      const { last: price } = await mercadoBitcoin.getTicker(asset);
      const orderValue = sellAmount * price;
      const currentFloatValue = await backed.getTotalPosition('BRL');

      const result = await backed.sell({
        asset,
        amount: sellAmount,
        orderValue,
      });

      const { balance } = await backed.getBalance();
      const newFloatValue = await backed.getTotalPosition('BRL');

      expect(result.status).toBe('ok');
      expect(balance).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ asset, position: 2 - sellAmount }),
        ])
      );
      expect(newFloatValue).toBeCloseTo(currentFloatValue + orderValue, 5);
    });

    it('does not register a sell operation for an invalid asset', async () => {
      const asset = 'BANANA3';
      const sellAmount = 2;
      const price = 1000;
      const orderValue = sellAmount * price;
      const currentFloatValue = await backed.getTotalPosition('BRL');
      const { total: currentTotal } = await backed.getBalance();

      const result = await backed.sell({
        asset,
        amount: sellAmount,
        orderValue,
      });

      const { balance, total: newTotal } = await backed.getBalance();
      const newFloatValue = await backed.getTotalPosition('BRL');

      expect(result.status).toBe('assetNotFound');
      expect(balance).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ asset })])
      );
      expect(newTotal).toBe(currentTotal);
      expect(newFloatValue).toBe(currentFloatValue);
    });

    it('does not register a sell operation if there are not enough stocks', async () => {
      const asset = 'MBCCSH06';
      const sellAmount = 5;
      const { last: price } = await mercadoBitcoin.getTicker(asset);
      const orderValue = sellAmount * price;
      const currentFloatValue = await backed.getTotalPosition('BRL');
      const { total: currentTotal } = await backed.getBalance();

      const result = await backed.sell({
        asset,
        amount: sellAmount,
        orderValue,
      });

      const { balance, total: newTotal } = await backed.getBalance();
      const newFloatValue = await backed.getTotalPosition('BRL');

      expect(result.status).toBe('notEnoughAssets');
      expect(balance).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ asset, position: 2 }),
        ])
      );
      expect(newTotal).toBe(currentTotal);
      expect(newFloatValue).toBe(currentFloatValue);
    });
  });
});
