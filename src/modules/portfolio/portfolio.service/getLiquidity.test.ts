import database from '../../../providers/database';
import getLiquidity from './getLiquidity';

type MockDatabase = typeof database & { resetMockValues: () => void };

jest.mock('../../../providers/googleSheets');
jest.mock('../../../providers/database');
jest.mock('../../../providers/brapi');
jest.mock('../../../providers/binance');
jest.mock('../../../providers/mercadoBitcoin');
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
      liquidityValue: 9312.044808024899,
      liquidityRatio: 0.48221965402677214,
      totalValue: 19310.794842691972,
    });
  });

  it('gets liquidity info for all portfolios when none is provided', async () => {
    const result = await getLiquidity();

    expect(result).toEqual([
      {
        portfolio: 'temp',
        liquidityValue: 0,
        liquidityRatio: 0,
        totalValue: 0,
      },
      {
        portfolio: 'viagem',
        liquidityValue: 0,
        liquidityRatio: 0,
        totalValue: 1796.6443113177536,
      },
      {
        portfolio: 'carro',
        liquidityValue: 0,
        liquidityRatio: 0,
        totalValue: 1946.797766169963,
      },
      {
        portfolio: 'rendaPassiva',
        liquidityValue: 0,
        liquidityRatio: 0,
        totalValue: 11820.367102413655,
      },
      {
        portfolio: 'previdencia',
        liquidityValue: 1295.807356032464,
        liquidityRatio: 0.06092728539774584,
        totalValue: 21268.096019265708,
      },
      {
        portfolio: 'amortecedor',
        liquidityValue: 9312.044808024899,
        liquidityRatio: 0.48221965402677214,
        totalValue: 19310.794842691972,
      },
      {
        portfolio: 'leni',
        liquidityValue: 528.316218100768,
        liquidityRatio: 0.6542814334205308,
        totalValue: 807.4754854937166,
      },
      {
        portfolio: 'seguroCarro',
        liquidityValue: 1873.346170519908,
        liquidityRatio: 0.7926952329691491,
        totalValue: 2363.2615570337566,
      },
      {
        portfolio: 'financiamento',
        liquidityValue: 7078.717302553882,
        liquidityRatio: 0.8133917461456165,
        totalValue: 8702.715925133845,
      },
      {
        portfolio: 'impostos',
        liquidityValue: 582.6593758394656,
        liquidityRatio: 0.8143531202717487,
        totalValue: 715.4873743776322,
      },
      {
        portfolio: 'mae',
        liquidityValue: 4775.388727014456,
        liquidityRatio: 0.8827141820347739,
        totalValue: 5409.89237989419,
      },
      {
        portfolio: 'suricat',
        liquidityValue: 4777.509167277586,
        liquidityRatio: 0.8978827467882704,
        totalValue: 5320.86086336635,
      },
      {
        portfolio: 'manutencaoCarro',
        liquidityValue: 2677.9221739719746,
        liquidityRatio: 0.9296763746777649,
        totalValue: 2880.488573134032,
      },
      {
        portfolio: 'reformaCasa',
        liquidityValue: 43808.068219067485,
        liquidityRatio: 0.9938881512485552,
        totalValue: 44077.46300630945,
      },
      {
        portfolio: 'congelamentoSuricats',
        liquidityValue: 652.31312034252,
        liquidityRatio: 1,
        totalValue: 652.31312034252,
      },
      {
        portfolio: 'total',
        liquidityValue: 77362.09263874541,
        liquidityRatio: 0.6088020322963648,
        totalValue: 127072.65832694454,
      },
    ]);
  });
});
