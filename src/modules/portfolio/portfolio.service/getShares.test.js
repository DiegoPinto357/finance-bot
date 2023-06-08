import getShares from './getShares';

jest.mock('../../../providers/googleSheets');
jest.mock('../../../providers/database');
jest.mock('../../../providers/tradingView');
jest.mock('../../../providers/binance');
jest.mock('../../../providers/mercadoBitcoin');
jest.mock('../../../providers/coinMarketCap');
jest.mock('../../../providers/blockchain');

describe('portfolio service - getShares', () => {
  it('gets shares for portfolio "previdencia"', async () => {
    const shares = await getShares('previdencia');

    expect(shares).toEqual({
      shares: [
        {
          assetClass: 'stock',
          asset: 'fii',
          value: 4550.180026999999,
          targetShare: 0.22,
          currentShare: 0.21530130064641675,
          diffBRL: 99.30236318759671,
        },
        {
          assetClass: 'stock',
          asset: 'us',
          value: 5407.97,
          targetShare: 0.26,
          currentShare: 0.2558894302967768,
          diffBRL: 86.87282476715882,
        },
        {
          assetClass: 'stock',
          asset: 'br',
          value: 3935.519970999999,
          targetShare: 0.19,
          currentShare: 0.1862173723783189,
          diffBRL: 79.94209325292468,
        },
        {
          assetClass: 'crypto',
          asset: 'hodl',
          value: 1434.671471380134,
          targetShare: 0.07,
          currentShare: 0.067884486318249,
          diffBRL: 44.70928913410103,
        },
        {
          assetClass: 'crypto',
          asset: 'defi',
          value: 609.1621219710817,
          targetShare: 0.03,
          currentShare: 0.028823782001297298,
          diffBRL: 24.858203963590427,
        },
        {
          assetClass: 'stock',
          asset: 'float',
          value: 154.059917105392,
          targetShare: 0,
          currentShare: 0.007289667734781706,
          diffBRL: -154.059917105392,
        },
        {
          assetClass: 'fixed',
          value: 5042.447356032464,
          targetShare: 0.23,
          currentShare: 0.23859396062415947,
          diffBRL: -181.62485719997767,
        },
      ],
      total: 21134.01086448907,
    });
  });

  it('gets shares for a portfolio without target definition', async () => {
    const shares = await getShares('financiamento');

    expect(shares).toEqual({
      shares: [
        {
          assetClass: 'fixed',
          value: 7078.717302553882,
          targetShare: 0.9,
          currentShare: 0.8189126501241224,
          diffBRL: 700.9226521261035,
        },
        {
          assetClass: 'crypto',
          asset: 'hodl',
          value: 182.51841815850264,
          targetShare: 0.06,
          currentShare: 0.021114932991704173,
          diffBRL: 336.12424548682975,
        },
        {
          assetClass: 'crypto',
          asset: 'defi',
          value: 266.5505693764885,
          targetShare: 0.04,
          currentShare: 0.030836325824375215,
          diffBRL: 79.2112063870664,
        },
        {
          assetClass: 'crypto',
          asset: 'backed',
          value: 1116.258104,
          targetShare: 0,
          currentShare: 0.12913609105979834,
          diffBRL: -1116.258104,
        },
      ],
      total: 8644.044394088873,
    });
  });

  it('sets diffBRL to 0 for portfolio without target share definition', async () => {
    const shares = await getShares('suricat');

    expect(shares).toEqual({
      shares: [
        {
          assetClass: 'crypto',
          asset: 'hodl',
          value: 244.33867596477316,
          targetShare: 0,
          currentShare: 0.0463912094297429,
          diffBRL: 0,
        },
        {
          assetClass: 'crypto',
          asset: 'defi',
          value: 245.06972515627345,
          targetShare: 0,
          currentShare: 0.04653000962587404,
          diffBRL: 0,
        },
        {
          asset: 'pagBankCDB120',
          assetClass: 'fixed',
          value: 406.70591249473637,
          targetShare: 0,
          currentShare: 0.07721896293478395,
          diffBRL: 0,
        },
        {
          asset: 'nubank',
          assetClass: 'fixed',
          value: 4370.80325478285,
          targetShare: 0,
          currentShare: 0.8298598180095992,
          diffBRL: 0,
        },
      ],
      total: 5266.917568398632,
    });
  });

  it('gets shares for all portfolios when portfolioType is not provided', async () => {
    const { shares, total } = await getShares();

    expect(shares).toHaveLength(15);
    expect(shares).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          portfolio: expect.any(String),
          shares: expect.any(Array),
        }),
      ])
    );
    expect(total).toBe(126116.99037688586);
  });
});
