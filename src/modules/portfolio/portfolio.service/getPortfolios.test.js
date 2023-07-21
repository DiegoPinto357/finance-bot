import getPortfolios from './getPortfolios';

jest.mock('../../../providers/database');
jest.mock('../../../providers/tradingView');

describe('portfolio service - getPortfolios', () => {
  it('returns list of portfolios', async () => {
    const portfolios = await getPortfolios();
    expect(portfolios).toEqual([
      'temp',
      'amortecedor',
      'financiamento',
      'viagem',
      'reformaCasa',
      'previdencia',
      'leni',
      'mae',
      'seguroCarro',
      'manutencaoCarro',
      'impostos',
      'suricat',
      'congelamentoSuricats',
      'carro',
      'rendaPassiva',
    ]);
  });
});
