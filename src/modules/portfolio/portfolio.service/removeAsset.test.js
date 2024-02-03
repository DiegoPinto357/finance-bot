import database from '../../../providers/database';
import getAssets from './getAssets';
import removeAsset from './removeAsset';

jest.mock('../../../providers/database');
jest.mock('../../../providers/brapi');

describe('portfolio service - removeAsset', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    database.resetMockValues();
  });

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

    const { status } = await removeAsset({
      assetClass,
      assetName,
    });

    const remainingAssets = await getAssets();

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

    const { status } = await removeAsset({
      assetClass,
      assetName,
    });

    const remainingAssets = await getAssets();

    expect(status).toBe('assetHasFunds');
    expect(remainingAssets).not.toContain(assetName);
    expect(databaseDeleteOneSpy).not.toBeCalledWith('portfolio', 'shares', {
      assetClass,
      assetName,
    });
  });
});
