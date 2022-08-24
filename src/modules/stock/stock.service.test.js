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

  describe('deposit', () => {
    it('deposits value on float', async () => {
      const value = 150;
      const asset = 'float';
      const currentFloatValue = await stock.getTotalPosition(asset);

      const result = await stock.deposit({ asset, value });

      const newFloatValue = await stock.getTotalPosition(asset);

      expect(result).toEqual({ status: 'ok' });
      expect(newFloatValue).toBe(currentFloatValue + value);
    });

    it('deposits value on float when asset param is not provided', async () => {
      const value = 357.98;
      const asset = 'float';
      const currentFloatValue = await stock.getTotalPosition(asset);

      const result = await stock.deposit({ value });

      const newFloatValue = await stock.getTotalPosition(asset);

      expect(result).toEqual({ status: 'ok' });
      expect(newFloatValue).toBe(currentFloatValue + value);
    });

    it.each(['br', 'us', 'fii'])(
      'does not deposits value for "%s" asset',
      async asset => {
        const value = 500;

        const currentValue = await stock.getTotalPosition(asset);

        const result = await stock.deposit({ asset, value });

        const newValue = await stock.getTotalPosition(asset);

        expect(result).toEqual({ status: 'cannotDepositValue' });
        expect(newValue).toBe(currentValue);
      }
    );

    it('does not withdrawn a value when funds are not enough', async () => {
      const value = -150000;
      const asset = 'float';

      const result = await stock.deposit({ asset, value });

      expect(result).toEqual({ status: 'notEnoughFunds' });
    });
  });

  describe('setAssetValue', () => {
    it('sets float value', async () => {
      const value = 357.75;
      const result = await stock.setAssetValue({ asset: 'float', value });

      const floatValue = await stock.getTotalPosition('float');

      expect(result).toEqual({ status: 'ok' });
      expect(floatValue).toBe(value);
    });

    it('sets float value when asset param is not provided', async () => {
      const value = 3467.34;
      const result = await stock.setAssetValue({ value });

      const floatValue = await stock.getTotalPosition('float');

      expect(result).toEqual({ status: 'ok' });
      expect(floatValue).toBe(value);
    });

    it.each(['br', 'us', 'fii'])(
      'does not sets asset value for "%s" portfolio type',
      async asset => {
        const value = 357.75;
        const currentValue = await stock.getTotalPosition(asset);

        const result = await stock.setAssetValue({ asset, value });

        const newValue = await stock.getTotalPosition(asset);

        expect(result).toEqual({ status: 'cannotSetValue' });
        expect(newValue).toBe(currentValue);
      }
    );
  });
});
