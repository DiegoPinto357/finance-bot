import getBalance from './getBalance';
import { Asset } from '../../../types';
import blockchain from '../../../providers/blockchain';

jest.mock('../../../providers/googleSheets');
jest.mock('../../../providers/database');
jest.mock('../../../providers/brapi');
jest.mock('../../../providers/binance');
jest.mock('../../../providers/mercadoBitcoin');
jest.mock('../../../providers/coinMarketCap');
jest.mock('../../../providers/blockchain');

type MockBlockchain = typeof blockchain & { resetMockValues: () => void };

describe('portfolio service - getBalance', () => {
  beforeEach(() => {
    (blockchain as MockBlockchain).resetMockValues();
  });

  describe('no portfolios provided', () => {
    it('gets the balance of all portfolios when no portfolio name is provided', async () => {
      const balance = await getBalance();

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
  });

  describe('single portfolio provided', () => {
    it('gets the balance for portfolio "previdencia"', async () => {
      const balance = await getBalance('previdencia');

      expect(balance).toEqual({
        balance: {
          crypto: {
            balance: [
              { asset: 'hodl', value: 1434.671471380134 },
              { asset: 'defi', value: 743.2472767477176 },
            ],
            total: 1434.671471380134 + 743.2472767477176,
          },
          fixed: {
            balance: [
              { asset: 'nubank', liquidity: true, value: 1295.807356032464 },
              { asset: 'nuInvestTDIPCA2035', value: 1489.11 },
              { asset: 'nuInvestCBDIPCA5_5', value: 1128.9 },
              { asset: 'nuInvestCDB12_5', value: 1128.63 },
            ],
            total: 1295.807356032464 + 1128.63 + 1128.9 + 1489.11,
          },
          stock: {
            balance: [
              { asset: 'float', value: 154.059917105392 },
              { asset: 'br', value: 3935.519970999999 },
              { asset: 'us', value: 5407.97 },
              { asset: 'fii', value: 4550.180026999999 },
            ],
            total: 14047.729915105388,
          },
        },
        total: 21268.096019265704,
      });
    });

    it('gets the balance for portfolio "suricat"', async () => {
      const balance = await getBalance('suricat');

      expect(balance).toEqual({
        balance: {
          crypto: {
            balance: [
              { asset: 'hodl', value: 244.33867596477316 },
              { asset: 'defi', value: 299.0130201239906 },
            ],
            total: 244.33867596477316 + 299.0130201239906,
          },
          fixed: {
            balance: [
              { asset: 'nubank', liquidity: true, value: 4370.80325478285 },
              {
                asset: 'pagBankCDB120',
                liquidity: true,
                value: 406.70591249473637,
              },
            ],
            total: 4777.509167277586,
          },
          stock: { balance: [], total: 0 },
        },
        total: 5320.86086336635,
      });
    });
  });

  describe('multiple portfolios provided', () => {
    it('gets the balance of a list of portfolio names', async () => {
      const balance = await getBalance(['amortecedor', 'suricat']);

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
