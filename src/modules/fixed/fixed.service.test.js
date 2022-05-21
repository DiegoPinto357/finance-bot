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
});
