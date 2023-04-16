const database = require('../../../providers/database');
const cryptoService = require('./');
const expectedHodlBalance = require('../../../../mockData/crypto/hodl/expectedBalance.json');
const expectedDefiBalance = require('../../../../mockData/crypto/defi/expectedBalance.json');
const expectedDefi2Balance = require('../../../../mockData/crypto/defi2/expectedBalance.json');
const expectedBackedBalance = require('../../../../mockData/crypto/backed/expectedBalance.json');

jest.mock('../../../providers/googleSheets');
jest.mock('../../../providers/database');
jest.mock('../../../providers/binance');
jest.mock('../../../providers/mercadoBitcoin');
jest.mock('../../../providers/coinMarketCap');
jest.mock('../../../providers/blockchain');

describe('crypto service', () => {
  beforeEach(() => database.resetMockValues());

  describe('getBalance', () => {
    it('gets HODL balance', async () => {
      const balance = await cryptoService.getBalance('hodl');
      expect(balance).toEqual(expectedHodlBalance);
    });

    it('gets DeFi balance', async () => {
      const balance = await cryptoService.getBalance('defi');
      expect(balance).toEqual(expectedDefiBalance);
    });

    it('gets DeFi 2 balance', async () => {
      const balance = await cryptoService.getBalance('defi2');
      expect(balance).toEqual(expectedDefi2Balance);
    });

    it('gets backed tokens balance', async () => {
      const balance = await cryptoService.getBalance('backed');
      expect(balance).toEqual(expectedBackedBalance);
    });
  });

  describe('getTotalPosition', () => {
    it('gets HODL total position', async () => {
      const total = await cryptoService.getTotalPosition('hodl');
      expect(total).toBe(expectedHodlBalance.total);
    });

    it('gets DeFi total position', async () => {
      const total = await cryptoService.getTotalPosition('defi');
      expect(total).toBe(expectedDefiBalance.total);
    });

    it('gets backed tokens total position', async () => {
      const total = await cryptoService.getTotalPosition('backed');
      expect(total).toBe(expectedBackedBalance.total);
    });

    it('gets Binance buffer total position', async () => {
      const total = await cryptoService.getTotalPosition('binanceBuffer');
      expect(total).toBe(2156.375642691);
    });

    it('gets total position for all crypto assets', async () => {
      const total = await cryptoService.getTotalPosition();
      expect(total).toEqual({
        hodl: expectedHodlBalance.total,
        defi: expectedDefiBalance.total,
        defi2: expectedDefi2Balance.total,
        backed: expectedBackedBalance.total,
        binanceBuffer: 2156.375642691,
      });
    });
  });

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

    it.each(['hodl', 'defi', 'backed'])(
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
      const currentBinanceBufferValue = await cryptoService.getTotalPosition(
        asset
      );

      const result = await cryptoService.deposit({ asset, value });

      const newBinanceBufferValue = await cryptoService.getTotalPosition(asset);

      expect(result).toEqual({ status: 'ok' });
      expect(newBinanceBufferValue).toBe(currentBinanceBufferValue + value);
    });

    // TODO is this a requirement?
    it('deposits value on binanceBuffer when asset param is not provided', async () => {
      const value = 357.98;
      const asset = 'binanceBuffer';
      const currentBinanceBufferValue = await cryptoService.getTotalPosition(
        asset
      );

      const result = await cryptoService.deposit({ value });

      const newBinanceBufferValue = await cryptoService.getTotalPosition(asset);

      expect(result).toEqual({ status: 'ok' });
      expect(newBinanceBufferValue).toBe(currentBinanceBufferValue + value);
    });

    it('deposits value on backed tokens', async () => {
      const value = 357;
      const asset = 'backed';
      const currentBackedValue = await cryptoService.getTotalPosition(asset);

      const result = await cryptoService.deposit({ asset, value });

      const newBackedValue = await cryptoService.getTotalPosition(asset);

      expect(result).toEqual({ status: 'ok' });
      expect(newBackedValue).toBe(currentBackedValue + value);
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
