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
          currentShare: 0.2139439291076276,
          diffBRL: 128.80109723845635,
        },
        {
          assetClass: 'stock',
          asset: 'us',
          value: 5407.97,
          targetShare: 0.26,
          currentShare: 0.2542761700483762,
          diffBRL: 121.73496500908368,
        },
        {
          assetClass: 'stock',
          asset: 'br',
          value: 3935.519970999999,
          targetShare: 0.19,
          currentShare: 0.18504336107167316,
          diffBRL: 105.41827266048585,
        },
        {
          assetClass: 'crypto',
          asset: 'hodl',
          value: 1434.671471380134,
          targetShare: 0.07,
          currentShare: 0.06745650715891713,
          diffBRL: 54.09524996846562,
        },
        {
          assetClass: 'crypto',
          asset: 'defi',
          value: 743.2472767477176,
          targetShare: 0.03,
          currentShare: 0.03494658271593503,
          diffBRL: -105.20439616974636,
        },
        {
          assetClass: 'fixed',
          value: 5042.447356032464,
          targetShare: 0.23,
          currentShare: 0.2370897400249069,
          diffBRL: -150.78527160135127,
        },
        {
          assetClass: 'stock',
          asset: 'float',
          value: 154.059917105392,
          targetShare: 0,
          currentShare: 0.0072437098725639006,
          diffBRL: -154.059917105392,
        },
      ],
      total: 21268.096019265708,
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
          currentShare: 0.8133917461456165,
          diffBRL: 753.7270300665787,
        },
        {
          assetClass: 'crypto',
          asset: 'hodl',
          value: 182.51841815850264,
          targetShare: 0.06,
          currentShare: 0.02097258140201739,
          diffBRL: 339.64453734952804,
        },
        {
          assetClass: 'crypto',
          asset: 'defi',
          value: 325.2221004214598,
          targetShare: 0.04,
          currentShare: 0.03737018457447328,
          diffBRL: 22.886536583894042,
        },
        {
          assetClass: 'crypto',
          asset: 'backed',
          value: 1116.258104,
          targetShare: 0,
          currentShare: 0.12826548787789283,
          diffBRL: -1116.258104,
        },
      ],
      total: 8702.715925133845,
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
          currentShare: 0.04592089179535271,
          diffBRL: 0,
        },
        {
          assetClass: 'crypto',
          asset: 'defi',
          value: 299.0130201239906,
          targetShare: 0,
          currentShare: 0.0561963614163769,
          diffBRL: 0,
        },
        {
          asset: 'pagBankCDB120',
          assetClass: 'fixed',
          value: 406.70591249473637,
          targetShare: 0,
          currentShare: 0.07643611117420306,
          diffBRL: 0,
        },
        {
          asset: 'nubank',
          assetClass: 'fixed',
          value: 4370.80325478285,
          targetShare: 0,
          currentShare: 0.8214466356140674,
          diffBRL: 0,
        },
      ],
      total: 5320.86086336635,
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
    expect(total).toBe(127072.65832694454);
  });
});
