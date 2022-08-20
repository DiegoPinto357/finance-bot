import binanceBuffer from './binanceBuffer';

jest.mock('../../../providers/database');
jest.mock('../../../providers/binance');

describe('crypto binanceBuffer service', () => {
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
});
