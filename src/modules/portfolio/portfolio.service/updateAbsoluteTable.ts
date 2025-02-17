import googleSheets from '../../../providers/googleSheets';
import getBalance from './getBalance';
import { services } from './common';
import { STOCK_ASSET_TYPE } from '../../../schemas';

import type { AssetName, AssetBalance } from '../../../types';
import type { CryptoAsset } from '../../../schemas';

type TotalRowPortfolios = Record<AssetName, number>;

type TotalRow = TotalRowPortfolios & {
  portfolios: 'total';
  total: number;
};

const flattenBalance = (
  balance: AssetBalance[] | undefined,
  totals: TotalRow
) => {
  if (!balance) return [];
  return balance.reduce(
    (values, { asset, value }) => {
      // TODO values and totals can be Maps
      values[asset] = value;
      totals[asset] = totals[asset] + value;
      return values;
    },
    {} as {
      [key in AssetName]: number;
    }
  );
};

export default async () => {
  const fixedAssets = await services['fixed'].getAssetsList();
  // TODO import from crypto service
  const cryptoAssets: CryptoAsset[] = [
    'binanceBuffer',
    'hodl',
    'defi',
    'defi2',
    'backed',
  ];
  const assets = [...fixedAssets, ...STOCK_ASSET_TYPE, ...cryptoAssets];
  const header = ['portfolios', ...assets, 'total'];

  const { balance } = await getBalance();

  const totalRow = assets.reduce(
    (totalRow, asset) => {
      // TODO total row can be a Map
      totalRow[asset] = 0;
      return totalRow;
    },
    { portfolios: 'total', total: 0 } as TotalRow
  );

  const rows = Object.entries(balance).map(
    ([portfolio, { balance, total }]) => {
      const fixedValues = flattenBalance(balance.fixed?.balance, totalRow);
      const stockValues = flattenBalance(balance.stock?.balance, totalRow);
      const cryptoValues = flattenBalance(balance.crypto?.balance, totalRow);

      totalRow.total = totalRow.total + total;
      return {
        portfolios: portfolio,
        ...fixedValues,
        ...stockValues,
        ...cryptoValues,
        total,
      };
    }
  );

  await googleSheets.setSheet('portfolio-absolute', header, [
    ...rows,
    totalRow,
  ]);
};
