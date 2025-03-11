import database from '../../../providers/database';
import { getFlags } from '../../system/system.service';
import cryptoService from './crypto.service';
import expectedHodlBalance from '../../../../mockData/crypto/hodl/expectedBalance.json';
import expectedDefiBalance from '../../../../mockData/crypto/defi/expectedBalance.json';
import expectedDefi2Balance from '../../../../mockData/crypto/defi2/expectedBalance.json';
import expectedBackedBalance from '../../../../mockData/crypto/backed/expectedBalance.json';

import type { CryptoAsset } from '../../../schemas';

type MockDatabase = typeof database & { resetMockValues: () => void };

jest.mock('../../../providers/googleSheets');
jest.mock('../../../providers/database');
jest.mock('../../../providers/brapi');
jest.mock('../../../providers/binance');
jest.mock('../../../providers/mercadoBitcoin');
jest.mock('../../../providers/coinMarketCap');
jest.mock('../../../providers/blockchain');

jest.mock('../../system/system.service.ts');

describe('crypto service', () => {
  beforeEach(() => (database as MockDatabase).resetMockValues());

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

  describe('getAssetPosition', () => {
    it('gets HODL total position', async () => {
      const total = await cryptoService.getAssetPosition('hodl');
      expect(total).toBe(expectedHodlBalance.total);
    });

    it('gets DeFi total position', async () => {
      const total = await cryptoService.getAssetPosition('defi');
      expect(total).toBe(expectedDefiBalance.total);
    });

    it('gets backed tokens total position', async () => {
      const total = await cryptoService.getAssetPosition('backed');
      expect(total).toBe(expectedBackedBalance.total);
    });

    it('gets Binance buffer total position', async () => {
      const total = await cryptoService.getAssetPosition('binanceBuffer');
      expect(total).toBe(2156.375642691);
    });
  });

  describe('getTotalPosition', () => {
    it('gets total position for all crypto assets', async () => {
      jest.mocked(getFlags).mockReturnValueOnce({ cryptoDefiEnabled: true });
      const total = await cryptoService.getTotalPosition();
      expect(total).toEqual({
        hodl: expectedHodlBalance.total,
        defi: expectedDefiBalance.total,
        defi2: expectedDefi2Balance.total,
        backed: expectedBackedBalance.total,
        binanceBuffer: 2156.375642691,
      });
    });

    it('gets total position for all crypto assets except defi and defi2 when cryptoDefiEnabled is disabled', async () => {
      jest.mocked(getFlags).mockReturnValueOnce({ cryptoDefiEnabled: false });
      const total = await cryptoService.getTotalPosition();
      expect(total).toEqual({
        hodl: expectedHodlBalance.total,
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
      const currentBinanceBufferValue = await cryptoService.getAssetPosition(
        asset
      );

      const result = await cryptoService.deposit({ asset, value });

      const newBinanceBufferValue = await cryptoService.getAssetPosition(asset);

      expect(result).toEqual({ status: 'ok' });
      expect(newBinanceBufferValue).toBe(currentBinanceBufferValue + value);
    });

    // TODO is this a requirement?
    it('deposits value on binanceBuffer when asset param is not provided', async () => {
      const value = 357.98;
      const asset = 'binanceBuffer';
      const currentBinanceBufferValue = await cryptoService.getAssetPosition(
        asset
      );

      const result = await cryptoService.deposit({ value });

      const newBinanceBufferValue = await cryptoService.getAssetPosition(asset);

      expect(result).toEqual({ status: 'ok' });
      expect(newBinanceBufferValue).toBe(currentBinanceBufferValue + value);
    });

    it.each(['hodl', 'defi'] as CryptoAsset[])(
      'does not deposits value for "%s" asset',
      async asset => {
        const value = 500;

        const currentValue = await cryptoService.getAssetPosition(asset);

        const result = await cryptoService.deposit({ asset, value });

        const newValue = await cryptoService.getAssetPosition(asset);

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
