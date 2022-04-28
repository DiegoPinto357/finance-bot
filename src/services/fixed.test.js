import fixed from './fixed';

jest.mock('../providers/googleSheets');

describe('fixed service', () => {
  describe('getValueByAsset', () => {
    it('gets to value for a given asset name', async () => {
      const value = await fixed.getValueByAsset('nubank');
      expect(value).toBe(50962.72);
    });
  });
});
