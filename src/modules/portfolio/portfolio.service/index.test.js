import googleSheets from '../../../providers/googleSheets';
import database from '../../../providers/database';
import { getAssetValueFromBalance } from './common';
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

  describe('swap', () => {
    beforeEach(() => googleSheets.resetMockValues());

    it('swap funds within same portfolio', async () => {
      const value = 100;
      const portfolio = 'financiamento';
      const origin = { class: 'fixed', name: 'nubank' };
      const destiny = { class: 'fixed', name: 'pagBankCDB120' };
      const liquidity = 'amortecedor';

      const [currentPortfolioBalance, currentLiquidityBalance] =
        await Promise.all([
          portfolioService.getBalance(portfolio),
          portfolioService.getBalance(liquidity),
        ]);

      const currentPortfolioOriginValue = getAssetValueFromBalance(
        currentPortfolioBalance,
        origin.class,
        origin.name
      );

      const currentPortfolioDestinyValue = getAssetValueFromBalance(
        currentPortfolioBalance,
        destiny.class,
        destiny.name
      );

      const currentLiquidityOriginValue = getAssetValueFromBalance(
        currentLiquidityBalance,
        origin.class,
        origin.name
      );

      const currentLiquidityDestinyValue = getAssetValueFromBalance(
        currentLiquidityBalance,
        destiny.class,
        destiny.name
      );

      const response = await portfolioService.swap({
        value,
        portfolio,
        origin,
        destiny,
        liquidity,
      });

      const [newPortfolioBalance, newLiquidityBalance] = await Promise.all([
        portfolioService.getBalance(portfolio),
        portfolioService.getBalance(liquidity),
      ]);

      const newPortfolioOriginValue = getAssetValueFromBalance(
        newPortfolioBalance,
        origin.class,
        origin.name
      );

      const newPortfolioDestinyValue = getAssetValueFromBalance(
        newPortfolioBalance,
        destiny.class,
        destiny.name
      );

      const newLiquidityOriginValue = getAssetValueFromBalance(
        newLiquidityBalance,
        origin.class,
        origin.name
      );

      const newLiquidityDestinyValue = getAssetValueFromBalance(
        newLiquidityBalance,
        destiny.class,
        destiny.name
      );

      expect(response.status).toBe('ok');
      expect(newPortfolioOriginValue).toBeCloseTo(
        currentPortfolioOriginValue - value,
        5
      );
      expect(newPortfolioDestinyValue).toBeCloseTo(
        currentPortfolioDestinyValue + value,
        5
      );
      expect(newLiquidityOriginValue).toBeCloseTo(
        currentLiquidityOriginValue + value,
        5
      );
      expect(newLiquidityDestinyValue).toBeCloseTo(
        currentLiquidityDestinyValue - value,
        5
      );
    });

    it('swap funds when asset shares  misses origin portfolio info', async () => {
      const value = 100;
      const portfolio = 'previdencia';
      const origin = { class: 'fixed', name: 'nubank' };
      const destiny = { class: 'fixed', name: 'pagBankCDB120' };
      const liquidity = 'amortecedor';

      const [currentPortfolioBalance, currentLiquidityBalance] =
        await Promise.all([
          portfolioService.getBalance(portfolio),
          portfolioService.getBalance(liquidity),
        ]);

      const currentPortfolioOriginValue = getAssetValueFromBalance(
        currentPortfolioBalance,
        origin.class,
        origin.name
      );

      const currentPortfolioDestinyValue = getAssetValueFromBalance(
        currentPortfolioBalance,
        destiny.class,
        destiny.name
      );

      const currentLiquidityOriginValue = getAssetValueFromBalance(
        currentLiquidityBalance,
        origin.class,
        origin.name
      );

      const currentLiquidityDestinyValue = getAssetValueFromBalance(
        currentLiquidityBalance,
        destiny.class,
        destiny.name
      );

      const response = await portfolioService.swap({
        value,
        portfolio,
        origin,
        destiny,
        liquidity,
      });

      const [newPortfolioBalance, newLiquidityBalance] = await Promise.all([
        portfolioService.getBalance(portfolio),
        portfolioService.getBalance(liquidity),
      ]);

      const newPortfolioOriginValue = getAssetValueFromBalance(
        newPortfolioBalance,
        origin.class,
        origin.name
      );

      const newPortfolioDestinyValue = getAssetValueFromBalance(
        newPortfolioBalance,
        destiny.class,
        destiny.name
      );

      const newLiquidityOriginValue = getAssetValueFromBalance(
        newLiquidityBalance,
        origin.class,
        origin.name
      );

      const newLiquidityDestinyValue = getAssetValueFromBalance(
        newLiquidityBalance,
        destiny.class,
        destiny.name
      );

      expect(response.status).toBe('ok');
      expect(newPortfolioOriginValue).toBeCloseTo(
        currentPortfolioOriginValue - value,
        5
      );
      expect(newPortfolioDestinyValue).toBeCloseTo(
        currentPortfolioDestinyValue + value,
        5
      );
      expect(newLiquidityOriginValue).toBeCloseTo(
        currentLiquidityOriginValue + value,
        5
      );
      expect(newLiquidityDestinyValue).toBeCloseTo(
        currentLiquidityDestinyValue - value,
        5
      );
    });

    it('swap funds when asset shares misses destiny portfolio info', async () => {
      const value = -100;
      const portfolio = 'previdencia';
      const origin = { class: 'fixed', name: 'pagBankCDB120' };
      const destiny = { class: 'fixed', name: 'nubank' };
      const liquidity = 'amortecedor';

      const [currentPortfolioBalance, currentLiquidityBalance] =
        await Promise.all([
          portfolioService.getBalance(portfolio),
          portfolioService.getBalance(liquidity),
        ]);

      const currentPortfolioOriginValue = getAssetValueFromBalance(
        currentPortfolioBalance,
        origin.class,
        origin.name
      );

      const currentPortfolioDestinyValue = getAssetValueFromBalance(
        currentPortfolioBalance,
        destiny.class,
        destiny.name
      );

      const currentLiquidityOriginValue = getAssetValueFromBalance(
        currentLiquidityBalance,
        origin.class,
        origin.name
      );

      const currentLiquidityDestinyValue = getAssetValueFromBalance(
        currentLiquidityBalance,
        destiny.class,
        destiny.name
      );

      const response = await portfolioService.swap({
        value,
        portfolio,
        origin,
        destiny,
        liquidity,
      });

      const [newPortfolioBalance, newLiquidityBalance] = await Promise.all([
        portfolioService.getBalance(portfolio),
        portfolioService.getBalance(liquidity),
      ]);

      const newPortfolioOriginValue = getAssetValueFromBalance(
        newPortfolioBalance,
        origin.class,
        origin.name
      );

      const newPortfolioDestinyValue = getAssetValueFromBalance(
        newPortfolioBalance,
        destiny.class,
        destiny.name
      );

      const newLiquidityOriginValue = getAssetValueFromBalance(
        newLiquidityBalance,
        origin.class,
        origin.name
      );

      const newLiquidityDestinyValue = getAssetValueFromBalance(
        newLiquidityBalance,
        destiny.class,
        destiny.name
      );

      expect(response.status).toBe('ok');
      expect(newPortfolioOriginValue).toBeCloseTo(
        currentPortfolioOriginValue - value,
        5
      );
      expect(newPortfolioDestinyValue).toBeCloseTo(
        currentPortfolioDestinyValue + value,
        5
      );
      expect(newLiquidityOriginValue).toBeCloseTo(
        currentLiquidityOriginValue + value,
        5
      );
      expect(newLiquidityDestinyValue).toBeCloseTo(
        currentLiquidityDestinyValue - value,
        5
      );
    });

    it('swap funds within same asset', async () => {
      const value = 100;
      const asset = { class: 'fixed', name: 'pagBankCDB120' };
      const origin = 'amortecedor';
      const destiny = 'suricat';
      const liquidity = { class: 'fixed', name: 'nubank' };

      const [currentOriginBalance, currentDestinyBalance] = await Promise.all([
        portfolioService.getBalance(origin),
        portfolioService.getBalance(destiny),
      ]);

      const currentPortfolioOriginValue = getAssetValueFromBalance(
        currentOriginBalance,
        asset.class,
        asset.name
      );

      const currentPortfolioDestinyValue = getAssetValueFromBalance(
        currentDestinyBalance,
        asset.class,
        asset.name
      );

      const currentLiquidityOriginValue = getAssetValueFromBalance(
        currentOriginBalance,
        liquidity.class,
        liquidity.name
      );

      const currentLiquidityDestinyValue = getAssetValueFromBalance(
        currentDestinyBalance,
        liquidity.class,
        liquidity.name
      );

      const response = await portfolioService.swap({
        value,
        asset,
        origin,
        destiny,
        liquidity,
      });

      const [newOriginBalance, newDestinyBalance] = await Promise.all([
        portfolioService.getBalance(origin),
        portfolioService.getBalance(destiny),
      ]);

      const newPortfolioOriginValue = getAssetValueFromBalance(
        newOriginBalance,
        asset.class,
        asset.name
      );

      const newPortfolioDestinyValue = getAssetValueFromBalance(
        newDestinyBalance,
        asset.class,
        asset.name
      );

      const newLiquidityOriginValue = getAssetValueFromBalance(
        newOriginBalance,
        liquidity.class,
        liquidity.name
      );

      const newLiquidityDestinyValue = getAssetValueFromBalance(
        newDestinyBalance,
        liquidity.class,
        liquidity.name
      );

      expect(response.status).toBe('ok');
      expect(newPortfolioOriginValue).toBeCloseTo(
        currentPortfolioOriginValue - value,
        5
      );
      expect(newPortfolioDestinyValue).toBeCloseTo(
        currentPortfolioDestinyValue + value,
        5
      );
      expect(newLiquidityOriginValue).toBeCloseTo(
        currentLiquidityOriginValue + value,
        5
      );
      expect(newLiquidityDestinyValue).toBeCloseTo(
        currentLiquidityDestinyValue - value,
        5
      );
    });

    it('swaps all funds within same portfolio', async () => {
      const value = 'all';
      const portfolio = 'impostos';
      const origin = { class: 'crypto', name: 'hodl' };
      const destiny = { class: 'fixed', name: 'nubank' };
      const liquidity = 'amortecedor';

      const [currentPortfolioBalance, currentLiquidityBalance] =
        await Promise.all([
          portfolioService.getBalance(portfolio),
          portfolioService.getBalance(liquidity),
        ]);

      const currentPortfolioOriginValue = getAssetValueFromBalance(
        currentPortfolioBalance,
        origin.class,
        origin.name
      );

      const currentPortfolioDestinyValue = getAssetValueFromBalance(
        currentPortfolioBalance,
        destiny.class,
        destiny.name
      );

      const currentLiquidityOriginValue = getAssetValueFromBalance(
        currentLiquidityBalance,
        origin.class,
        origin.name
      );

      const currentLiquidityDestinyValue = getAssetValueFromBalance(
        currentLiquidityBalance,
        destiny.class,
        destiny.name
      );

      const response = await portfolioService.swap({
        value,
        portfolio,
        origin,
        destiny,
        liquidity,
      });

      const [newPortfolioBalance, newLiquidityBalance] = await Promise.all([
        portfolioService.getBalance(portfolio),
        portfolioService.getBalance(liquidity),
      ]);

      const newPortfolioOriginValue = getAssetValueFromBalance(
        newPortfolioBalance,
        origin.class,
        origin.name
      );

      const newPortfolioDestinyValue = getAssetValueFromBalance(
        newPortfolioBalance,
        destiny.class,
        destiny.name
      );

      const newLiquidityOriginValue = getAssetValueFromBalance(
        newLiquidityBalance,
        origin.class,
        origin.name
      );

      const newLiquidityDestinyValue = getAssetValueFromBalance(
        newLiquidityBalance,
        destiny.class,
        destiny.name
      );

      expect(response.status).toBe('ok');
      expect(newPortfolioOriginValue).toBe(0);
      expect(newPortfolioDestinyValue).toBe(
        currentPortfolioDestinyValue + currentPortfolioOriginValue
      );
      expect(newLiquidityOriginValue).toBe(
        currentLiquidityOriginValue + currentPortfolioOriginValue
      );
      expect(newLiquidityDestinyValue).toBe(
        currentLiquidityDestinyValue - currentPortfolioOriginValue
      );
    });

    describe('no liquidity available', () => {
      it('does not swap funds within same portfolio', async () => {
        const value = 10000;
        const portfolio = 'financiamento';
        const origin = { class: 'fixed', name: 'nubank' };
        const destiny = { class: 'crypto', name: 'defi' };
        const liquidity = 'amortecedor';

        const [currentOriginBalance, currentDestinyBalance] = await Promise.all(
          [
            portfolioService.getBalance(portfolio),
            portfolioService.getBalance(liquidity),
          ]
        );

        const currentPortfolioOriginValue = getAssetValueFromBalance(
          currentOriginBalance,
          origin.class,
          origin.name
        );

        const currentPortfolioDestinyValue = getAssetValueFromBalance(
          currentDestinyBalance,
          destiny.class,
          destiny.name
        );

        const currentLiquidityOriginValue = getAssetValueFromBalance(
          currentOriginBalance,
          origin.class,
          origin.name
        );

        const currentLiquidityDestinyValue = getAssetValueFromBalance(
          currentDestinyBalance,
          destiny.class,
          destiny.name
        );

        const response = await portfolioService.swap({
          value,
          portfolio,
          origin,
          destiny,
          liquidity,
        });

        const [newOriginBalance, newDestinyBalance] = await Promise.all([
          portfolioService.getBalance(portfolio),
          portfolioService.getBalance(liquidity),
        ]);

        const newPortfolioOriginValue = getAssetValueFromBalance(
          newOriginBalance,
          origin.class,
          origin.name
        );

        const newPortfolioDestinyValue = getAssetValueFromBalance(
          newDestinyBalance,
          destiny.class,
          destiny.name
        );

        const newLiquidityOriginValue = getAssetValueFromBalance(
          newOriginBalance,
          origin.class,
          origin.name
        );

        const newLiquidityDestinyValue = getAssetValueFromBalance(
          newDestinyBalance,
          destiny.class,
          destiny.name
        );

        expect(response.status).toBe('notEnoughFunds');
        expect(newPortfolioOriginValue).toBe(currentPortfolioOriginValue);
        expect(newPortfolioDestinyValue).toBe(currentPortfolioDestinyValue);
        expect(newLiquidityOriginValue).toBe(currentLiquidityOriginValue);
        expect(newLiquidityDestinyValue).toBe(currentLiquidityDestinyValue);
      });

      it('does not swap funds within same asset', async () => {
        const value = 10000;
        const asset = { class: 'crypto', name: 'hodl' };
        const origin = 'amortecedor';
        const destiny = 'suricat';
        const liquidity = { class: 'fixed', name: 'nubank' };

        const [currentOriginBalance, currentDestinyBalance] = await Promise.all(
          [
            portfolioService.getBalance(origin),
            portfolioService.getBalance(destiny),
          ]
        );

        const currentPortfolioOriginValue = getAssetValueFromBalance(
          currentOriginBalance,
          asset.class,
          asset.name
        );

        const currentPortfolioDestinyValue = getAssetValueFromBalance(
          currentDestinyBalance,
          asset.class,
          asset.name
        );

        const currentLiquidityOriginValue = getAssetValueFromBalance(
          currentOriginBalance,
          liquidity.class,
          liquidity.name
        );

        const currentLiquidityDestinyValue = getAssetValueFromBalance(
          currentDestinyBalance,
          liquidity.class,
          liquidity.name
        );

        const response = await portfolioService.swap({
          value,
          asset,
          origin,
          destiny,
          liquidity,
        });

        const [newOriginBalance, newDestinyBalance] = await Promise.all([
          portfolioService.getBalance(origin),
          portfolioService.getBalance(destiny),
        ]);

        const newPortfolioOriginValue = getAssetValueFromBalance(
          newOriginBalance,
          asset.class,
          asset.name
        );

        const newPortfolioDestinyValue = getAssetValueFromBalance(
          newDestinyBalance,
          asset.class,
          asset.name
        );

        const newLiquidityOriginValue = getAssetValueFromBalance(
          newOriginBalance,
          liquidity.class,
          liquidity.name
        );

        const newLiquidityDestinyValue = getAssetValueFromBalance(
          newDestinyBalance,
          liquidity.class,
          liquidity.name
        );

        expect(response.status).toBe('notEnoughFunds');
        expect(newPortfolioOriginValue).toBe(currentPortfolioOriginValue);
        expect(newPortfolioDestinyValue).toBe(currentPortfolioDestinyValue);
        expect(newLiquidityOriginValue).toBe(currentLiquidityOriginValue);
        expect(newLiquidityDestinyValue).toBe(currentLiquidityDestinyValue);
      });
    });
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
