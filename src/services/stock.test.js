import stock from './stock';

jest.mock('../providers/googleSheets');

describe('stock service', () => {
  describe('getTotalPosition', () => {
    it('gets total stock position', async () => {
      const value = await stock.getTotalPosition();
      expect(value).toEqual({
        br: 3745.260019,
        fii: 4556.149945,
        us: 5399.55019,
      });
    });
  });

  describe('getTotalPosition', () => {
    it('gets total stock position for a given asset', async () => {
      const value = await stock.getTotalPosition('br');
      expect(value).toBe(3745.260019);
    });
  });
});
