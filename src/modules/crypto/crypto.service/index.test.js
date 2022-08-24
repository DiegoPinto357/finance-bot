import database from '../../../providers/database';
import cryptoService from './';

jest.mock('../../../providers/googleSheets');
jest.mock('../../../providers/database');
jest.mock('../../../providers/binance');
jest.mock('../../../providers/coinMarketCap');
jest.mock('../../../providers/blockchain');

describe('crypto service', () => {
  beforeEach(() => database.resetMockValues());

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

  describe('deposit', () => {
    it('deposits value on binanceBuffer', async () => {
      const value = 150;
      const asset = 'binanceBuffer';
      const currentbinanceBufferValue = await cryptoService.getTotalPosition(
        asset
      );

      const result = await cryptoService.deposit({ asset, value });

      const newbinanceBufferValue = await cryptoService.getTotalPosition(asset);

      expect(result).toEqual({ status: 'ok' });
      expect(newbinanceBufferValue).toBe(currentbinanceBufferValue + value);
    });

    it('deposits value on binanceBuffer when asset param is not provided', async () => {
      const value = 357.98;
      const asset = 'binanceBuffer';
      const currentbinanceBufferValue = await cryptoService.getTotalPosition(
        asset
      );

      const result = await cryptoService.deposit({ value });

      const newbinanceBufferValue = await cryptoService.getTotalPosition(asset);

      expect(result).toEqual({ status: 'ok' });
      expect(newbinanceBufferValue).toBe(currentbinanceBufferValue + value);
    });

    it.each(['hodl', 'defi'])(
      'does not deposits value for "%s" asset',
      async asset => {
        const value = 500;

        const currentValue = await cryptoService.getTotalPosition(asset);

        const result = await cryptoService.deposit({ asset, value });

        const newValue = await cryptoService.getTotalPosition(asset);

        expect(result).toEqual({ status: 'cannotDepositValue' });
        expect(newValue).toBe(currentValue);
      }
    );

    it('does not withdrawn a value when funds are not enough', async () => {
      const value = -150000;
      const asset = 'binanceBuffer';

      const result = await cryptoService.deposit({ asset, value });

      expect(result).toEqual({ status: 'notEnoughFunds' });
    });
  });
});
