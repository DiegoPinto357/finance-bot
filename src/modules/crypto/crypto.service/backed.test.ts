import backed from './backed';
import mercadoBitcoin, {
  AssetBalance,
  Candles,
  Ticker,
} from '../../../providers/mercadoBitcoin';
import expectedBalance from '../../../../mockData/crypto/backed/expectedBalance.json';

jest.mock('../../../providers/database');
jest.mock('../../../providers/mercadoBitcoin');

const mecadoBitcoinMock = jest.mocked(mercadoBitcoin);

// Mock factories
function createAccountBalanceMock(overrides: Partial<AssetBalance> = {}) {
  return {
    symbol: 'DEFAULT_SYMBOL',
    total: '0',
    available: '0',
    on_hold: '0',
    ...overrides,
  };
}

function createTickerMock(overrides: Partial<Ticker> = {}) {
  return {
    pair: 'DEFAULT_PAIR',
    last: '0',
    sell: '0',
    buy: '0',
    high: '0',
    low: '0',
    open: '0',
    vol: '0',
    date: 0,
    ...overrides,
  };
}

function createCandlesMock(overrides: Partial<Candles> = {}) {
  return {
    l: ['0'],
    c: [],
    h: [],
    o: [],
    t: [],
    v: [],
    ...overrides,
  };
}

describe('crypto backed tokens service', () => {
  describe('getBalance', () => {
    it('gets backed tokens balance', async () => {
      const balance = await backed.getBalance();
      expect(balance).toEqual(expectedBalance);
    });

    it('uses overridden value if available', async () => {
      mecadoBitcoinMock.getAccountBalance.mockResolvedValueOnce([
        createAccountBalanceMock({ symbol: 'IMOB02', total: '1' }),
      ]);
      mecadoBitcoinMock.getTickers.mockResolvedValueOnce([
        createTickerMock({ pair: 'IMOB02-BRL' }),
      ]);

      const balance = await backed.getBalance();
      expect(
        balance.balance.find(item => item.asset === 'IMOB02')?.priceBRL
      ).toBe(137.66);
    });

    it('fetches last price correctly', async () => {
      mecadoBitcoinMock.getAccountBalance.mockResolvedValueOnce([
        createAccountBalanceMock({ symbol: 'BTC', total: '1' }),
      ]);
      mecadoBitcoinMock.getTickers.mockResolvedValueOnce([
        createTickerMock({ pair: 'BTC-BRL', last: '100.00' }),
      ]);

      const balance = await backed.getBalance();
      expect(balance.balance.find(item => item.asset === 'BTC')?.priceBRL).toBe(
        100.0
      );
    });

    it('fetches candle price when last price is zero', async () => {
      mecadoBitcoinMock.getAccountBalance.mockResolvedValueOnce([
        createAccountBalanceMock({ symbol: 'BTC', total: '1' }),
      ]);
      mecadoBitcoinMock.getTickers.mockResolvedValueOnce([
        createTickerMock({ pair: 'BTC-BRL', last: '0' }),
      ]);
      mecadoBitcoinMock.getCandles.mockResolvedValueOnce(
        createCandlesMock({ l: ['200.00'] })
      );

      const balance = await backed.getBalance();
      expect(balance.balance.find(item => item.asset === 'BTC')?.priceBRL).toBe(
        200.0
      );
    });

    it('falls back to sell price when necessary', async () => {
      mecadoBitcoinMock.getAccountBalance.mockResolvedValueOnce([
        createAccountBalanceMock({ symbol: 'BTC', total: '1' }),
      ]);
      mecadoBitcoinMock.getTickers.mockResolvedValueOnce([
        createTickerMock({ pair: 'BTC-BRL', sell: '105.00' }),
      ]);
      mecadoBitcoinMock.getCandles.mockResolvedValueOnce(
        createCandlesMock({ l: ['0'] })
      );

      const balance = await backed.getBalance();
      expect(balance.balance.find(item => item.asset === 'BTC')?.priceBRL).toBe(
        105.0
      );
    });

    it('falls back to buy price if no other prices are available', async () => {
      mecadoBitcoinMock.getAccountBalance.mockResolvedValueOnce([
        createAccountBalanceMock({ symbol: 'BTC', total: '1' }),
      ]);
      mecadoBitcoinMock.getTickers.mockResolvedValueOnce([
        createTickerMock({ pair: 'BTC-BRL', buy: '95.00' }),
      ]);
      mecadoBitcoinMock.getCandles.mockResolvedValueOnce(
        createCandlesMock({ l: ['0'] })
      );

      const balance = await backed.getBalance();
      expect(balance.balance.find(item => item.asset === 'BTC')?.priceBRL).toBe(
        95.0
      );
    });

    it('returns 0 when no prices are available', async () => {
      mecadoBitcoinMock.getAccountBalance.mockResolvedValueOnce([
        createAccountBalanceMock({ symbol: 'BTC', total: '1' }),
      ]);
      mecadoBitcoinMock.getTickers.mockResolvedValueOnce([
        createTickerMock({ pair: 'BTC-BRL' }),
      ]);
      mecadoBitcoinMock.getCandles.mockResolvedValueOnce(
        createCandlesMock({ l: ['0'] })
      );

      const balance = await backed.getBalance();
      expect(balance.balance.find(item => item.asset === 'BTC')?.priceBRL).toBe(
        0
      );
    });
  });

  describe('getTotalPosition', () => {
    it('gets backed tokens total position', async () => {
      const totalPosition = await backed.getTotalPosition();
      expect(totalPosition).toEqual(expectedBalance.total);
    });

    it('gets total position of given asset', async () => {
      const asset = 'BRL';
      const totalPosition = await backed.getTotalPosition(asset);
      expect(totalPosition).toEqual(
        expectedBalance.balance.find(item => item.asset === asset)?.positionBRL
      );
    });
  });
});
