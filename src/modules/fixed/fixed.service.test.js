import database from '../../providers/database';
import fixed from './fixed.service';

jest.mock('../../providers/database');

describe('fixed service', () => {
  beforeEach(() => database.resetMockValues());

  describe('getTotalPosition', () => {
    it('gets total fixed position', async () => {
      const value = await fixed.getTotalPosition();
      expect(value).toBe(86332.44);
    });
  });

  describe('getTotalPosition', () => {
    it('gets total fixed position for a given asset', async () => {
      const value = await fixed.getTotalPosition('nubank');
      expect(value).toBe(50962.72);
    });
  });

  describe('getAssetsList', () => {
    it('gets the assets list', async () => {
      const assets = await fixed.getAssetsList();
      expect(assets).toEqual([
        'nubank',
        '99pay',
        'pagBankCDB120',
        'xpWesternAsset',
        'daycovalCDB110',
        'daycovalCDBCDI1_2',
        'nuInvestCDB8_5',
        'nuInvestCDB9_5',
        'nuInvestCDB12_5',
        'nuInvestCBDIPCA5_5',
        'nuInvestTDIPCA2035',
      ]);
    });
  });

  describe('setAssetValue', () => {
    it('set a new value for a given asset', async () => {
      const newValue = 99999.99;
      const assetName = 'nubank';

      await fixed.setAssetValue({ asset: assetName, value: newValue });

      const { balance } = await fixed.getBalance();
      const assetValue = balance.find(({ asset }) => asset === assetName).value;

      expect(assetValue).toBe(newValue);
    });
  });

  describe('deposit', () => {
    it('deposits a value for a given asset', async () => {
      const value = 150;
      const assetName = 'nubank';

      const currentPosition = await fixed.getTotalPosition('nubank');

      const result = await fixed.deposit({ asset: assetName, value });

      const { balance } = await fixed.getBalance();
      const newPosition = balance.find(
        ({ asset }) => asset === assetName
      ).value;

      expect(result).toEqual({ status: 'ok' });
      expect(newPosition).toBe(currentPosition + value);
    });

    it('does not withdrawn a value when funds are not enough', async () => {
      const value = 99999;
      const assetName = 'nubank';

      const currentPosition = await fixed.getTotalPosition('nubank');

      const result = await fixed.deposit({ asset: assetName, value: -value });

      const { balance } = await fixed.getBalance();
      const newPosition = balance.find(
        ({ asset }) => asset === assetName
      ).value;

      expect(result).toEqual({ status: 'notEnoughFunds' });
      expect(newPosition).toBe(currentPosition);
    });
  });
});
