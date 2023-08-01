import getAssets from './getAssets';

jest.mock('../../../providers/database');

describe('portfolio service - getAssets', () => {
  it('returns list of assets', async () => {
    const assets = await getAssets();
    expect(assets).toEqual([
      { assetClass: 'fixed', assetName: 'nubank' },
      { assetClass: 'fixed', assetName: '99pay' },
      { assetClass: 'fixed', assetName: 'pagBankCDB120' },
      { assetClass: 'fixed', assetName: 'xpWesternAsset' },
      { assetClass: 'fixed', assetName: 'daycovalCDB110' },
      { assetClass: 'fixed', assetName: 'daycovalCDBCDI1_2' },
      { assetClass: 'fixed', assetName: 'nuInvestCDB8_5' },
      { assetClass: 'fixed', assetName: 'nuInvestCDB9_5' },
      { assetClass: 'fixed', assetName: 'nuInvestCBDIPCA5_5' },
      { assetClass: 'fixed', assetName: 'nuInvestCDB12_5' },
      { assetClass: 'fixed', assetName: 'nuInvestTDIPCA2035' },
      { assetClass: 'stock', assetName: 'br' },
      { assetClass: 'stock', assetName: 'fii' },
      { assetClass: 'stock', assetName: 'us' },
      { assetClass: 'stock', assetName: 'float' },
      { assetClass: 'crypto', assetName: 'binanceBuffer' },
      { assetClass: 'crypto', assetName: 'hodl' },
      { assetClass: 'crypto', assetName: 'defi' },
      { assetClass: 'crypto', assetName: 'defi2' },
      { assetClass: 'crypto', assetName: 'anchor' },
      { assetClass: 'crypto', assetName: 'backed' },
    ]);
  });
});
