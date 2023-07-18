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
      liquidityValue: 9312.044808024899,
      liquidityRatio: 0.4971571671582283,
      totalValue: 18730.585463049738,
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
        totalValue: 1776.069665768761,
      },
      {
        portfolio: 'carro',
        liquidityValue: 0,
        liquidityRatio: 0,
        totalValue: 1933.9107734481859,
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
        liquidityRatio: 0.06131383977897804,
        totalValue: 21134.01086448907,
      },
      {
        portfolio: 'amortecedor',
        liquidityValue: 9312.044808024899,
        liquidityRatio: 0.4971571671582283,
        totalValue: 18730.585463049738,
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
        liquidityRatio: 0.8009682463082121,
        totalValue: 2338.851982153417,
      },
      {
        portfolio: 'financiamento',
        liquidityValue: 7078.717302553882,
        liquidityRatio: 0.8140338668843236,
        totalValue: 8695.851107088874,
      },
      {
        portfolio: 'impostos',
        liquidityValue: 582.6593758394656,
        liquidityRatio: 0.8405357044951619,
        totalValue: 693.2000303180689,
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
        liquidityRatio: 0.9070787809443831,
        totalValue: 5266.917568398632,
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
        liquidityRatio: 0.9949852269644923,
        totalValue: 44028.862973893025,
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
        liquidityRatio: 0.6131634320301135,
        totalValue: 126168.79708988586,
      },
    ]);
  });
});
