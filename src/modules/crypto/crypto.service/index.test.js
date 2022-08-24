import cryptoService from './';

jest.mock('../../../providers/database');
jest.mock('../../../providers/binance');

describe('crypto service', () => {
  describe('setAssetValue', () => {
    it('sets binanceBuffer value', async () => {
      const value = 357.75;
      const result = await cryptoService.setAssetValue({
        asset: 'binanceBuffer',
        value,
      });

      const newAssetValue = await cryptoService.getPosition({
        type: 'binanceBuffer',
        asset: 'BRL',
      });

      expect(result).toEqual({ status: 'ok' });
      expect(newAssetValue).toBe(value);
    });

    it('sets binanceBuffer value when asset param is not provided', async () => {
      const value = 3467.34;
      const result = await cryptoService.setAssetValue({ value });

      const newAssetValue = await cryptoService.getPosition({
        type: 'binanceBuffer',
        asset: 'BRL',
      });

      expect(result).toEqual({ status: 'ok' });
      expect(newAssetValue).toBe(value);
    });

    it.each(['hodl', 'defi'])(
      'does not sets value for "%s" asset',
      async asset => {
        const value = 357.75;
        const currentValue = await cryptoService.getPosition({
          type: 'binanceBuffer',
          asset: 'BRL',
        });

        const result = await cryptoService.setAssetValue({ asset, value });

        const newAssetValue = await cryptoService.getPosition({
          type: 'binanceBuffer',
          asset: 'BRL',
        });

        expect(result).toEqual({ status: 'cannotSetValue' });
        expect(newAssetValue).toBe(currentValue);
      }
    );
  });
});
