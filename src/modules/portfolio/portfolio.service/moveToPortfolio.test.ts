import { getAssetValueFromBalance } from './common';
import getBalance from './getBalance';
import { Asset, Portfolio } from '../../../types';
import moveToPortfolio from './moveToPortfolio';

jest.mock('../../../providers/googleSheets');
jest.mock('../../../providers/database');
jest.mock('../../../providers/tradingView');
jest.mock('../../../providers/binance');
jest.mock('../../../providers/mercadoBitcoin');
jest.mock('../../../providers/coinMarketCap');
jest.mock('../../../providers/blockchain');

describe('portfolio service - moveToPortfolio', () => {
  it('moves value from one portfolio to another', async () => {
    const value = 100;
    const asset: Asset = { class: 'fixed', name: 'nubank' };
    const origin: Portfolio = 'financiamento';
    const destiny: Portfolio = 'previdencia';

    const [currentOriginBalance, currentDestinyBalance] = await Promise.all([
      getBalance(origin),
      getBalance(destiny),
    ]);

    const currentOriginBalanceValue = getAssetValueFromBalance(
      currentOriginBalance,
      asset.class,
      asset.name
    );

    const currentDestinyBalanceValue = getAssetValueFromBalance(
      currentDestinyBalance,
      asset.class,
      asset.name
    );

    const response = await moveToPortfolio({
      value,
      asset,
      origin,
      destiny,
    });

    const [newOriginBalance, newDestinyBalance] = await Promise.all([
      getBalance(origin),
      getBalance(destiny),
    ]);

    const newOriginBalanceValue = getAssetValueFromBalance(
      newOriginBalance,
      asset.class,
      asset.name
    );

    const newDestinyBalanceValue = getAssetValueFromBalance(
      newDestinyBalance,
      asset.class,
      asset.name
    );

    expect(response.status).toBe('ok');
    expect(newOriginBalanceValue).toBe(currentOriginBalanceValue - value);
    expect(newDestinyBalanceValue).toBe(currentDestinyBalanceValue + value);
  });

  it('moves all funds from one portfolio to another', async () => {
    const value = 'all';
    const asset: Asset = { class: 'crypto', name: 'defi2' };
    const origin: Portfolio = 'previdencia';
    const destiny: Portfolio = 'viagem';

    const [currentOriginBalance, currentDestinyBalance] = await Promise.all([
      getBalance(origin),
      getBalance(destiny),
    ]);

    const currentOriginBalanceValue = getAssetValueFromBalance(
      currentOriginBalance,
      asset.class,
      asset.name
    );

    const currentDestinyBalanceValue = getAssetValueFromBalance(
      currentDestinyBalance,
      asset.class,
      asset.name
    );

    const response = await moveToPortfolio({
      value,
      asset,
      origin,
      destiny,
    });

    const [newOriginBalance, newDestinyBalance] = await Promise.all([
      getBalance(origin),
      getBalance(destiny),
    ]);

    const newOriginBalanceValue = getAssetValueFromBalance(
      newOriginBalance,
      asset.class,
      asset.name
    );

    const newDestinyBalanceValue = getAssetValueFromBalance(
      newDestinyBalance,
      asset.class,
      asset.name
    );

    expect(response.status).toBe('ok');
    expect(newOriginBalanceValue).toBe(0);
    expect(newDestinyBalanceValue).toBeCloseTo(
      currentDestinyBalanceValue + currentOriginBalanceValue,
      5
    );
  });

  it('does not move value from one portfolio to another when there are not enough funds', async () => {
    const value = 20000;
    const asset: Asset = { class: 'fixed', name: 'nubank' };
    const origin: Portfolio = 'financiamento';
    const destiny: Portfolio = 'previdencia';

    const [currentOriginBalance, currentDestinyBalance] = await Promise.all([
      getBalance(origin),
      getBalance(destiny),
    ]);

    const currentOriginBalanceValue = getAssetValueFromBalance(
      currentOriginBalance,
      asset.class,
      asset.name
    );

    const currentDestinyBalanceValue = getAssetValueFromBalance(
      currentDestinyBalance,
      asset.class,
      asset.name
    );

    const response = await moveToPortfolio({
      value,
      asset,
      origin,
      destiny,
    });

    const [newOriginBalance, newDestinyBalance] = await Promise.all([
      getBalance(origin),
      getBalance(destiny),
    ]);

    const newOriginBalanceValue = getAssetValueFromBalance(
      newOriginBalance,
      asset.class,
      asset.name
    );

    const newDestinyBalanceValue = getAssetValueFromBalance(
      newDestinyBalance,
      asset.class,
      asset.name
    );

    expect(response.status).toBe('notEnoughFunds');
    expect(newOriginBalanceValue).toBe(currentOriginBalanceValue);
    expect(newDestinyBalanceValue).toBe(currentDestinyBalanceValue);
  });
});
