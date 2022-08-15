import database from '../../providers/database';
import stock from './stock.service';

jest.mock('../../providers/database');
jest.mock('../../providers/tradingView');

describe('stock service', () => {
  beforeEach(() => database.resetMockValues());

  describe('getTotalPosition', () => {
    it('gets total stock position', async () => {
      const value = await stock.getTotalPosition();

      const expectedTotals = {
        br: 3935.519970999999,
        fii: 4550.180026999999,
        us: 5407.97,
        float: 654.97,
      };

      expect(value).toEqual({
        ...expectedTotals,
        total:
          expectedTotals.br +
          expectedTotals.fii +
          expectedTotals.us +
          expectedTotals.float,
      });
    });

    it('gets total stock position for a given asset', async () => {
      const value = await stock.getTotalPosition('br');
      expect(value).toBe(3935.519970999999);
    });

    it('gets total stock floating position', async () => {
      const value = await stock.getTotalPosition('float');
      expect(value).toBe(654.97);
    });
  });
});
