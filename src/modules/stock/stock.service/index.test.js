import database from '../../../providers/database';
import tradingView from '../../../providers/tradingView';
import stock from '.';
import stockData from '../../../../mockData/stock/balance.json';

jest.mock('../../../providers/database');
jest.mock('../../../providers/tradingView');

describe('stock service', () => {
  beforeEach(() => database.resetMockValues());

  describe('getBalance', () => {
    it('gets balance for provided portfolio type', async () => {
      const portfolioType = 'br';
      const { balance, total } = await stock.getBalance(portfolioType);

      expect(balance).toEqual(stockData[portfolioType].balance);
      expect(total).toBe(stockData[portfolioType].total);
    });
  });

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

  describe('buy', () => {
    it('registers a buy operation', async () => {
      const asset = 'NASD11';
      const buyAmount = 12;
      const { lp: price } = await tradingView.getTicker(asset);
      const orderValue = buyAmount * price;
      const currentFloatValue = await stock.getTotalPosition('float');

      const result = await stock.buy({ asset, amount: buyAmount, orderValue });

      const { balance, total } = await stock.getBalance('us');
      const newFloatValue = await stock.getTotalPosition('float');

      expect(result.status).toBe('ok');
      expect(balance).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ asset, amount: 129 + buyAmount }),
        ])
      );
      expect(total).toBe(5407.97 + orderValue);
      expect(newFloatValue).toBe(currentFloatValue - orderValue);
    });

    it('does not register a buy operation for an invalid asset', async () => {
      const asset = 'BANANA3';
      const buyAmount = 100;
      const price = 1000;
      const orderValue = buyAmount * price;
      const currentFloatValue = await stock.getTotalPosition('float');

      const result = await stock.buy({ asset, amount: buyAmount, orderValue });

      const { balance, total } = await stock.getBalance('us');
      const newFloatValue = await stock.getTotalPosition('float');

      expect(result.status).toBe('assetNotFound');
      expect(balance).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ asset })])
      );
      expect(total).toBe(5407.97);
      expect(newFloatValue).toBe(currentFloatValue);
    });
  });

  describe('sell', () => {
    it('registers a sell operation', async () => {
      const asset = 'NASD11';
      const sellAmount = 12;
      const { lp: price } = await tradingView.getTicker(asset);
      const orderValue = sellAmount * price;
      const currentFloatValue = await stock.getTotalPosition('float');

      const result = await stock.sell({
        asset,
        amount: sellAmount,
        orderValue,
      });

      const { balance, total } = await stock.getBalance('us');
      const newFloatValue = await stock.getTotalPosition('float');

      expect(result.status).toBe('ok');
      expect(balance).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ asset, amount: 129 - sellAmount }),
        ])
      );
      expect(total).toBeCloseTo(5407.97 - orderValue, 5);
      expect(newFloatValue).toBeCloseTo(currentFloatValue + orderValue, 5);
    });

    it('does not register a sell operation for an invalid asset', async () => {
      const asset = 'BANANA3';
      const sellAmount = 100;
      const price = 1000;
      const orderValue = sellAmount * price;
      const currentFloatValue = await stock.getTotalPosition('float');

      const result = await stock.sell({
        asset,
        amount: sellAmount,
        orderValue,
      });

      const { balance, total } = await stock.getBalance('us');
      const newFloatValue = await stock.getTotalPosition('float');

      expect(result.status).toBe('assetNotFound');
      expect(balance).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ asset })])
      );
      expect(total).toBe(5407.97);
      expect(newFloatValue).toBe(currentFloatValue);
    });

    it('does not register a sell operation if there are not enough stocks', async () => {
      const asset = 'NASD11';
      const sellAmount = 1000;
      const { lp: price } = await tradingView.getTicker(asset);
      const orderValue = sellAmount * price;
      const currentFloatValue = await stock.getTotalPosition('float');

      const result = await stock.sell({
        asset,
        amount: sellAmount,
        orderValue,
      });

      const { balance, total } = await stock.getBalance('us');
      const newFloatValue = await stock.getTotalPosition('float');

      expect(result.status).toBe('notEnoughStocks');
      expect(balance).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ asset, amount: 129 }),
        ])
      );
      expect(total).toBe(5407.97);
      expect(newFloatValue).toBe(currentFloatValue);
    });
  });
});
