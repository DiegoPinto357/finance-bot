import database from '../../providers/database';
import { FixedAsset } from '../../schemas';
import fixed from './fixed.service';

type MockDatabase = typeof database & { resetMockValues: () => void };

jest.mock('../../providers/database');

describe('fixed service', () => {
  beforeEach(() => (database as MockDatabase).resetMockValues());

  describe('getBalance', () => {
    it('gets the balance for given asset', async () => {
      const { balance, total } = await fixed.getBalance('nubank');

      expect(balance).toEqual([
        { asset: 'nubank', liquidity: true, value: 50962.72 },
      ]);
      expect(total).toBe(50962.72);
    });

    it('gets sorted balance for all assets when asset is not provided', async () => {
      const { balance, total } = await fixed.getBalance();

      expect(balance).toEqual([
        { asset: 'nubank', liquidity: true, value: 50962.72 },
        { asset: 'xpWesternAsset', liquidity: true, value: 10393.77 },
        { asset: 'pagBankCDB120', liquidity: true, value: 5254.21 },
        { asset: 'daycovalCDB110', liquidity: true, value: 5000 },
        { asset: 'daycovalCDBCDI1_2', liquidity: true, value: 5000 },
        { asset: 'nuInvestCDB8_5', value: 3260.39 },
        { asset: 'nuInvestCDB9_5', value: 2194.88 },
        { asset: 'nuInvestTDIPCA2035', value: 1489.11 },
        { asset: 'nuInvestCBDIPCA5_5', value: 1128.9 },
        { asset: 'nuInvestCDB12_5', value: 1128.63 },
        { asset: '99pay', liquidity: true, value: 519.83 },
      ]);
      expect(total).toBe(86332.44);
    });

    it('gets the balance for a list of given assets', async () => {
      const { balance, total } = await fixed.getBalance([
        'nubank',
        'xpWesternAsset',
        'nuInvestCDB12_5',
      ]);

      expect(balance).toEqual([
        { asset: 'nubank', liquidity: true, value: 50962.72 },
        { asset: 'xpWesternAsset', liquidity: true, value: 10393.77 },
        { asset: 'nuInvestCDB12_5', value: 1128.63 },
      ]);
      expect(total).toBe(50962.72 + 10393.77 + 1128.63);
    });
  });

  describe('getAssetPosition', () => {
    it('gets position for a given asset', async () => {
      const value = await fixed.getAssetPosition('nubank');
      expect(value).toBe(50962.72);
    });

    it('gets 0 as position for an asset that does not exists', async () => {
      const value = await fixed.getAssetPosition(
        'pupancaBamerindus' as FixedAsset
      );
      expect(value).toBe(0);
    });
  });

  describe('getTotalPosition', () => {
    it('gets total fixed position', async () => {
      const totals = await fixed.getTotalPosition();

      const expectedTotals = {
        withLiquidity: 77130.53000000001,
        withoutLiquidity: 9201.909999999989,
      };

      expect(totals).toEqual({
        ...expectedTotals,
        total: expectedTotals.withLiquidity + expectedTotals.withoutLiquidity,
      });
    });
  });

  describe('getAssetsList', () => {
    it('gets the assets list', async () => {
      const assets = await fixed.getAssetsList();
      expect(assets).toEqual([
        'nubank',
        '99pay',
        'pagBankCDB120',
        'xpWesternAsset',
        'daycovalCDB110',
        'daycovalCDBCDI1_2',
        'nuInvestCDB8_5',
        'nuInvestCDB9_5',
        'nuInvestCDB12_5',
        'nuInvestCBDIPCA5_5',
        'nuInvestTDIPCA2035',
      ]);
    });
  });

  describe('setAssetValue', () => {
    it('set a new value for a given asset', async () => {
      const newValue = 99999.99;
      const assetName = 'nubank';

      await fixed.setAssetValue({ asset: assetName, value: newValue });

      const { balance } = await fixed.getBalance();
      const assetValue = balance.find(
        ({ asset }) => asset === assetName
      )?.value;

      expect(assetValue).toBe(newValue);
    });

    it('insert record if asset does no exists on database', async () => {
      const newValue = 100;
      const assetName = 'poupancaBamerindus' as FixedAsset;

      await fixed.setAssetValue({ asset: assetName, value: newValue });

      const { balance } = await fixed.getBalance();
      const assetValue = balance.find(
        ({ asset }) => asset === assetName
      )?.value;

      expect(assetValue).toBe(newValue);
    });
  });

  describe('deposit', () => {
    it('deposits a value for a given asset', async () => {
      const value = 150;
      const assetName = 'nubank';

      const currentPosition = await fixed.getAssetPosition(assetName);

      const result = await fixed.deposit({ asset: assetName, value });

      const { balance } = await fixed.getBalance();
      const newPosition = balance.find(
        ({ asset }) => asset === assetName
      )?.value;

      expect(result).toEqual({ status: 'ok' });
      expect(newPosition).toBe(currentPosition + value);
    });

    it('does not withdrawn a value when funds are not enough', async () => {
      const value = 99999;
      const assetName = 'nubank';

      const currentPosition = await fixed.getAssetPosition(assetName);

      const result = await fixed.deposit({ asset: assetName, value: -value });

      const { balance } = await fixed.getBalance();
      const newPosition = balance.find(
        ({ asset }) => asset === assetName
      )?.value;

      expect(result).toEqual({ status: 'notEnoughFunds' });
      expect(newPosition).toBe(currentPosition);
    });

    it('deposits a value for a non existing asset', async () => {
      const value = 150;
      const assetName = 'poupancaBamerindus' as FixedAsset;

      const currentPosition = await fixed.getAssetPosition(assetName);

      const result = await fixed.deposit({ asset: assetName, value });

      const { balance } = await fixed.getBalance();
      const newPosition = balance.find(
        ({ asset }) => asset === assetName
      )?.value;

      expect(result).toEqual({ status: 'ok' });
      expect(newPosition).toBe(currentPosition + value);
    });
  });

  describe('removeAsset', () => {
    it('removes an asset with no funds', async () => {
      const asset = 'nubank';
      await fixed.setAssetValue({ asset, value: 0 });

      const { status } = await fixed.removeAsset(asset);

      const remainingAssets = await fixed.getAssetsList();

      expect(status).toBe('ok');
      expect(remainingAssets).not.toContain(asset);
    });

    it('does not remove an asset if it still have funds', async () => {
      const asset = 'nubank';

      const { status } = await fixed.removeAsset(asset);

      const remainingAssets = await fixed.getAssetsList();

      expect(status).toBe('assetHasFunds');
      expect(remainingAssets).toContain(asset);
    });
  });
});
