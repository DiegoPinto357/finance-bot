import database from '../../../providers/database';
import portfolioService from '.';

jest.mock('../../../providers/googleSheets');
jest.mock('../../../providers/database');
jest.mock('../../../providers/tradingView');
jest.mock('../../../providers/binance');
jest.mock('../../../providers/mercadoBitcoin');
jest.mock('../../../providers/coinMarketCap');
jest.mock('../../../providers/blockchain');

describe('portfolio service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    database.resetMockValues();
  });

  describe('getAssets', () => {
    it('returns list of assets', async () => {
      const assets = await portfolioService.getAssets();
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

    describe('removeAsset', () => {
      it('removes a fixed asset with no funds', async () => {
        const assetClass = 'fixed';
        const assetName = 'nubank';
        await database.updateOne(
          'assets',
          'fixed',
          { asset: assetName },
          { $set: { value: 0 } }
        );

        const databaseDeleteOneSpy = jest.spyOn(database, 'deleteOne');

        const { status } = await portfolioService.removeAsset({
          assetClass,
          assetName,
        });

        const remainingAssets = await portfolioService.getAssets();

        expect(status).toBe('ok');
        expect(remainingAssets).not.toContain(assetName);
        expect(databaseDeleteOneSpy).toBeCalledWith('portfolio', 'shares', {
          assetClass,
          assetName,
        });
      });

      it('does not remove a fixed asset if it still have funds', async () => {
        const assetClass = 'fixed';
        const assetName = 'nubank';

        const databaseDeleteOneSpy = jest.spyOn(database, 'deleteOne');

        const { status } = await portfolioService.removeAsset({
          assetClass,
          assetName,
        });

        const remainingAssets = await portfolioService.getAssets();

        expect(status).toBe('assetHasFunds');
        expect(remainingAssets).not.toContain(assetName);
        expect(databaseDeleteOneSpy).not.toBeCalledWith('portfolio', 'shares', {
          assetClass,
          assetName,
        });
      });
    });
  });
});
