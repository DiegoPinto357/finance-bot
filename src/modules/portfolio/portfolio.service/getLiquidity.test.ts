import database from '../../../providers/database';
import getLiquidity from './getLiquidity';

type MockDatabase = typeof database & { resetMockValues: () => void };

jest.mock('../../../providers/googleSheets');
jest.mock('../../../providers/database');
jest.mock('../../../providers/tradingView');
jest.mock('../../../providers/binance');
jest.mock('../../../providers/coinMarketCap');
jest.mock('../../../providers/blockchain');

describe('portfolio service - getLiquidity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (database as MockDatabase).resetMockValues();
  });

  it('gets liquidity info for provide portfolio', async () => {
    const result = await getLiquidity('amortecedor');

    expect(result).toEqual({
      portfolio: 'amortecedor',
      liquidValue: 3567.3904,
      liquidRatio: 0.1904580295708041,
      totalValue: 18730.585463049738,
    });
  });

  it('gets liquidity info for all portfolios when none is provided', async () => {
    const result = await getLiquidity();

    expect(result).toEqual([
      { portfolio: 'temp', liquidValue: 0, liquidRatio: 0, totalValue: 0 },
      {
        portfolio: 'viagem',
        liquidValue: 0,
        liquidRatio: 0,
        totalValue: 1776.069665768761,
      },
      {
        portfolio: 'carro',
        liquidValue: 0,
        liquidRatio: 0,
        totalValue: 1933.9107734481859,
      },
      {
        portfolio: 'rendaPassiva',
        liquidValue: 0,
        liquidRatio: 0,
        totalValue: 11820.367102413655,
      },
      {
        portfolio: 'previdencia',
        liquidValue: 1295.807356032464,
        liquidRatio: 0.06131383977897804,
        totalValue: 21134.01086448907,
      },
      {
        portfolio: 'amortecedor',
        liquidValue: 3567.3904,
        liquidRatio: 0.1904580295708041,
        totalValue: 18730.585463049738,
      },
      {
        portfolio: 'financiamento',
        liquidValue: 5153.352886268896,
        liquidRatio: 0.5851371445248256,
        totalValue: 8807.085543088873,
      },

      {
        portfolio: 'reformaCasa',
        liquidValue: 26009.01120556749,
        liquidRatio: 0.5907263883010009,
        totalValue: 44028.862973893025,
      },

      {
        portfolio: 'leni',
        liquidValue: 528.316218100768,
        liquidRatio: 0.6542814334205308,
        totalValue: 807.4754854937166,
      },
      {
        portfolio: 'seguroCarro',
        liquidValue: 1581.3179202991073,
        liquidRatio: 0.6761085918926617,
        totalValue: 2338.851982153417,
      },
      {
        portfolio: 'suricat',
        liquidValue: 4370.80325478285,
        liquidRatio: 0.8298598180095992,
        totalValue: 5266.917568398632,
      },
      {
        portfolio: 'impostos',
        liquidValue: 582.6593758394656,
        liquidRatio: 0.8405357044951619,
        totalValue: 693.2000303180689,
      },
      {
        portfolio: 'mae',
        liquidValue: 4775.388727014456,
        liquidRatio: 0.8827141820347739,
        totalValue: 5409.89237989419,
      },

      {
        portfolio: 'manutencaoCarro',
        liquidValue: 2677.9221739719746,
        liquidRatio: 0.9296763746777649,
        totalValue: 2880.488573134032,
      },

      {
        portfolio: 'congelamentoSuricats',
        liquidValue: 652.31312034252,
        liquidRatio: 1,
        totalValue: 652.31312034252,
      },
      {
        portfolio: 'total',
        liquidValue: 51194.282638219986,
        liquidRatio: 0.4054028338417526,
        totalValue: 126280.03152588586,
      },
    ]);
  });
});
