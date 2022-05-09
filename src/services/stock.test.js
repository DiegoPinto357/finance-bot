import stock from './stock';

jest.mock('../providers/googleSheets');
jest.mock('../providers/tradingView');

describe('stock service', () => {
  describe('getTotalPosition', () => {
    it('gets total stock position', async () => {
      const value = await stock.getTotalPosition();

      const expectedTotals = {
        br: 3935.519970999999,
        fii: 4550.180026999999,
        us: 5407.97,
      };

      expect(value).toEqual({
        ...expectedTotals,
        total: expectedTotals.br + expectedTotals.fii + expectedTotals.us,
      });
    });

    it('gets total stock position for a given asset', async () => {
      const value = await stock.getTotalPosition('br');
      expect(value).toBe(3935.519970999999);
    });
  });
});
