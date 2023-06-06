import database from '../../../providers/database';
import portfolioService from '.';

jest.mock('../../../providers/googleSheets');
jest.mock('../../../providers/database');
jest.mock('../../../providers/tradingView');
jest.mock('../../../providers/binance');
jest.mock('../../../providers/coinMarketCap');
jest.mock('../../../providers/blockchain');

describe('portfolio service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    database.resetMockValues();
  });

  describe('getBalance', () => {
    it('gets the balance for portfolio "previdencia"', async () => {
      const balance = await portfolioService.getBalance('previdencia');

      expect(balance).toEqual({
        balance: {
          crypto: {
            balance: [
              { asset: 'hodl', value: 1434.671471380134 },
              { asset: 'defi', value: 609.1621219710817 },
            ],
            total: 1434.671471380134 + 609.1621219710817,
          },
          fixed: {
            balance: [
              { asset: 'nubank', value: 1295.807356032464 },
              { asset: 'nuInvestCDB12_5', value: 1128.63 },
              { asset: 'nuInvestCBDIPCA5_5', value: 1128.9 },
              { asset: 'nuInvestTDIPCA2035', value: 1489.11 },
            ],
            total: 1295.807356032464 + 1128.63 + 1128.9 + 1489.11,
          },
          stock: {
            balance: [
              { asset: 'br', value: 3935.519970999999 },
              { asset: 'us', value: 5407.97 },
              { asset: 'fii', value: 4550.180026999999 },
              { asset: 'float', value: 154.059917105392 },
            ],
            total:
              3935.519970999999 +
              5407.97 +
              4550.180026999999 +
              154.059917105392,
          },
        },
        total: 21134.01086448907,
      });
    });

    it('gets the balance for portfolio "suricat"', async () => {
      const balance = await portfolioService.getBalance('suricat');

      expect(balance).toEqual({
        balance: {
          crypto: {
            balance: [
              { asset: 'hodl', value: 244.33867596477316 },
              { asset: 'defi', value: 245.06972515627345 },
            ],
            total: 244.33867596477316 + 245.06972515627345,
          },
          fixed: {
            balance: [
              { asset: 'nubank', value: 4370.80325478285 },
              { asset: 'pagBankCDB120', value: 406.70591249473637 },
            ],
            total: 4777.509167277586,
          },
          stock: { balance: [], total: 0 },
        },
        total: 5266.917568398632,
      });
    });

    it('gets the balance for portfolio "temp"', async () => {
      const balance = await portfolioService.getBalance('temp');

      expect(balance).toEqual({
        balance: {
          crypto: { balance: [], total: 0 },
          fixed: { balance: [], total: 0 },
          stock: { balance: [], total: 0 },
        },
        total: 0,
      });
    });

    it('gets the balance of all portfolios when no portfolio name is provided', async () => {
      const balance = await portfolioService.getBalance();

      const expectedBalance = expect.objectContaining({
        balance: {
          crypto: { balance: expect.any(Array), total: expect.any(Number) },
          fixed: { balance: expect.any(Array), total: expect.any(Number) },
          stock: { balance: expect.any(Array), total: expect.any(Number) },
        },
        total: expect.any(Number),
      });

      expect(balance).toEqual({
        balance: {
          temp: expectedBalance,
          amortecedor: expectedBalance,
          financiamento: expectedBalance,
          viagem: expectedBalance,
          reformaCasa: expectedBalance,
          previdencia: expectedBalance,
          leni: expectedBalance,
          mae: expectedBalance,
          seguroCarro: expectedBalance,
          manutencaoCarro: expectedBalance,
          impostos: expectedBalance,
          suricat: expectedBalance,
          congelamentoSuricats: expectedBalance,
          carro: expectedBalance,
          rendaPassiva: expectedBalance,
        },
        total: expect.any(Number),
      });
    });

    it('gets the balance of a list of portfolio names', async () => {
      const balance = await portfolioService.getBalance([
        'amortecedor',
        'suricat',
      ]);

      const expectedBalance = expect.objectContaining({
        balance: {
          crypto: { balance: expect.any(Array), total: expect.any(Number) },
          fixed: { balance: expect.any(Array), total: expect.any(Number) },
          stock: { balance: expect.any(Array), total: expect.any(Number) },
        },
        total: expect.any(Number),
      });

      expect(balance).toEqual({
        balance: {
          amortecedor: expectedBalance,
          suricat: expectedBalance,
        },
        total: expect.any(Number),
      });
    });
  });
});
