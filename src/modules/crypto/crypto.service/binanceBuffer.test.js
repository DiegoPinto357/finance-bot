import database from '../../../providers/database';
import binanceBuffer from './binanceBuffer';

jest.mock('../../../providers/database');
jest.mock('../../../providers/binance');

describe('crypto binanceBuffer service', () => {
  beforeEach(() => database.resetMockValues());

  describe('getTotalPosition', () => {
    it('gets total position', async () => {
      const total = await binanceBuffer.getTotalPosition();
      expect(total).toBe(2156.375642691);
    });

    it('gets total posotion for a given asset', async () => {
      const total = await binanceBuffer.getTotalPosition('BRL');
      expect(total).toBe(6.8284);
    });
  });

  describe('setAssetValue', () => {
    it('sets BRL value', async () => {
      const value = 357.75;
      const result = await binanceBuffer.setAssetValue({ asset: 'BRL', value });

      const newAssetValue = await binanceBuffer.getTotalPosition('BRL');

      expect(result).toEqual({ status: 'ok' });
      expect(newAssetValue).toBe(value);
    });

    it('sets BRL value when asset param is not provided', async () => {
      const value = 3467.34;
      const result = await binanceBuffer.setAssetValue({ value });

      const newAssetValue = await binanceBuffer.getTotalPosition('BRL');

      expect(result).toEqual({ status: 'ok' });
      expect(newAssetValue).toBe(value);
    });

    it.each(['BNB', 'MATIC', 'BUSD', 'USDT', 'BTC'])(
      'does not sets value for "%s" asset',
      async asset => {
        const value = 357.75;
        const currentValue = await binanceBuffer.getTotalPosition(asset);

        const result = await binanceBuffer.setAssetValue({ asset, value });

        const newAssetValue = await binanceBuffer.getTotalPosition(asset);

        expect(result).toEqual({ status: 'cannotSetValue' });
        expect(newAssetValue).toBe(currentValue);
      }
    );
  });

  describe('deposit', () => {
    it('deposits value on BRL', async () => {
      const value = 150;
      const asset = 'BRL';
      const currentBRLValue = await binanceBuffer.getTotalPosition(asset);

      const result = await binanceBuffer.deposit({ asset, value });

      const newBRLValue = await binanceBuffer.getTotalPosition(asset);

      expect(result).toEqual({ status: 'ok' });
      expect(newBRLValue).toBe(currentBRLValue + value);
    });

    it('deposits value on BRL when asset param is not provided', async () => {
      const value = 357.98;
      const asset = 'BRL';
      const currentBRLValue = await binanceBuffer.getTotalPosition(asset);

      const result = await binanceBuffer.deposit({ value });

      const newBRLValue = await binanceBuffer.getTotalPosition(asset);

      expect(result).toEqual({ status: 'ok' });
      expect(newBRLValue).toBe(currentBRLValue + value);
    });

    it.each(['br', 'us', 'fii'])(
      'does not deposits value for "%s" asset',
      async asset => {
        const value = 500;

        const currentValue = await binanceBuffer.getTotalPosition(asset);

        const result = await binanceBuffer.deposit({ asset, value });

        const newValue = await binanceBuffer.getTotalPosition(asset);

        expect(result).toEqual({ status: 'cannotDepositValue' });
        expect(newValue).toBe(currentValue);
      }
    );

    it('does not withdrawn a value when funds are not enough', async () => {
      const value = -150000;
      const asset = 'BRL';

      const result = await binanceBuffer.deposit({ asset, value });

      expect(result).toEqual({ status: 'notEnoughFunds' });
    });
  });
});
