import fixed from './fixed.service';

jest.mock('../../providers/googleSheets');

describe('fixed service', () => {
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
});
