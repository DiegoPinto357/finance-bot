import googleSheets from '../../../providers/googleSheets';
import { Asset, AssetName, FixedAsset, Portfolio } from '../../../types';
import { getAssetValueFromBalance } from './common';
import getBalance from './getBalance';
import swap from './swap';

type MockGoogleSheets = typeof googleSheets & { resetMockValues: () => void };

jest.mock('../../../providers/googleSheets');
jest.mock('../../../providers/database');
jest.mock('../../../providers/tradingView');
jest.mock('../../../providers/binance');
jest.mock('../../../providers/mercadoBitcoin');
jest.mock('../../../providers/coinMarketCap');
jest.mock('../../../providers/blockchain');

describe('portfolio service - swap', () => {
  beforeEach(() => (googleSheets as MockGoogleSheets).resetMockValues());

  it('swap funds within same portfolio', async () => {
    const value = 100;
    const portfolio: Portfolio = 'financiamento';
    const origin: Asset = { class: 'fixed', name: 'nubank' };
    const destiny: Asset = {
      class: 'fixed',
      // TODO map pagBankCDB120 as AssetName type?
      name: 'pagBankCDB120' as FixedAsset,
    };
    const liquidity: Portfolio = 'amortecedor';

    const [currentPortfolioBalance, currentLiquidityBalance] =
      await Promise.all([getBalance(portfolio), getBalance(liquidity)]);

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

    const response = await swap({
      value,
      portfolio,
      origin,
      destiny,
      liquidity,
    });

    const [newPortfolioBalance, newLiquidityBalance] = await Promise.all([
      getBalance(portfolio),
      getBalance(liquidity),
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
    const portfolio: Portfolio = 'previdencia';
    const origin: Asset = { class: 'fixed', name: 'nubank' };
    const destiny: Asset = {
      class: 'fixed',
      // TODO map pagBankCDB120 as AssetName type?
      name: 'pagBankCDB120' as FixedAsset,
    };
    const liquidity: Portfolio = 'amortecedor';

    const [currentPortfolioBalance, currentLiquidityBalance] =
      await Promise.all([getBalance(portfolio), getBalance(liquidity)]);

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

    const response = await swap({
      value,
      portfolio,
      origin,
      destiny,
      liquidity,
    });

    const [newPortfolioBalance, newLiquidityBalance] = await Promise.all([
      getBalance(portfolio),
      getBalance(liquidity),
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
    const portfolio: Portfolio = 'previdencia';
    const origin: Asset = {
      class: 'fixed',
      // TODO map pagBankCDB120 as AssetName type?
      name: 'pagBankCDB120' as FixedAsset,
    };
    const destiny: Asset = { class: 'fixed', name: 'nubank' };
    const liquidity: Portfolio = 'amortecedor';

    const [currentPortfolioBalance, currentLiquidityBalance] =
      await Promise.all([getBalance(portfolio), getBalance(liquidity)]);

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

    const response = await swap({
      value,
      portfolio,
      origin,
      destiny,
      liquidity,
    });

    const [newPortfolioBalance, newLiquidityBalance] = await Promise.all([
      getBalance(portfolio),
      getBalance(liquidity),
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
    // TODO map pagBankCDB120 as AssetName type?
    const asset: Asset = {
      class: 'fixed',
      name: 'pagBankCDB120' as FixedAsset,
    };
    const origin: Portfolio = 'amortecedor';
    const destiny: Portfolio = 'suricat';
    const liquidity: Asset = { class: 'fixed', name: 'nubank' };

    const [currentOriginBalance, currentDestinyBalance] = await Promise.all([
      getBalance(origin),
      getBalance(destiny),
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

    const response = await swap({
      value,
      asset,
      origin,
      destiny,
      liquidity,
    });

    const [newOriginBalance, newDestinyBalance] = await Promise.all([
      getBalance(origin),
      getBalance(destiny),
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
    const portfolio: Portfolio = 'impostos';
    const origin: Asset = { class: 'crypto', name: 'hodl' };
    const destiny: Asset = { class: 'fixed', name: 'nubank' };
    const liquidity: Portfolio = 'amortecedor';

    const [currentPortfolioBalance, currentLiquidityBalance] =
      await Promise.all([getBalance(portfolio), getBalance(liquidity)]);

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

    const response = await swap({
      value,
      portfolio,
      origin,
      destiny,
      liquidity,
    });

    const [newPortfolioBalance, newLiquidityBalance] = await Promise.all([
      getBalance(portfolio),
      getBalance(liquidity),
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
    expect(newLiquidityDestinyValue).toBeCloseTo(
      currentLiquidityDestinyValue - currentPortfolioOriginValue,
      5
    );
  });

  describe('no liquidity available', () => {
    it('does not swap funds within same portfolio', async () => {
      const value = 10000;
      const portfolio: Portfolio = 'financiamento';
      const origin: Asset = { class: 'fixed', name: 'nubank' };
      const destiny: Asset = { class: 'crypto', name: 'defi' };
      const liquidity: Portfolio = 'amortecedor';

      const [currentOriginBalance, currentDestinyBalance] = await Promise.all([
        getBalance(portfolio),
        getBalance(liquidity),
      ]);

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

      const response = await swap({
        value,
        portfolio,
        origin,
        destiny,
        liquidity,
      });

      const [newOriginBalance, newDestinyBalance] = await Promise.all([
        getBalance(portfolio),
        getBalance(liquidity),
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
      const asset: Asset = { class: 'crypto', name: 'hodl' };
      const origin: Portfolio = 'amortecedor';
      const destiny: Portfolio = 'suricat';
      const liquidity: Asset = { class: 'fixed', name: 'nubank' };

      const [currentOriginBalance, currentDestinyBalance] = await Promise.all([
        getBalance(origin),
        getBalance(destiny),
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

      const response = await swap({
        value,
        asset,
        origin,
        destiny,
        liquidity,
      });

      const [newOriginBalance, newDestinyBalance] = await Promise.all([
        getBalance(origin),
        getBalance(destiny),
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
