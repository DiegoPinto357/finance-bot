import googleSheets from '../../../providers/googleSheets';
import getBalance from './getBalance';
import { services } from './common';
import { CryptoAsset, StockAsset, AssetName } from '../../../types';
import { AssetBalance } from './types';

type TotalRowPortfolios = {
  [key in AssetName]: number;
};

interface TotalRow extends TotalRowPortfolios {
  portfolios: 'total';
  total: number;
}

const flattenBalance = (balance: AssetBalance[], totals: TotalRow) =>
  balance.reduce((values, { asset, value }) => {
    // TODO values and totals can be Maps
    values[asset] = value;
    totals[asset] = totals[asset] + value;
    return values;
  }, {} as { [key in AssetName]: number });

export default async () => {
  const fixedAssets = await services['fixed'].getAssetsList();
  const stockAssets: StockAsset[] = ['float', 'br', 'fii', 'us'];
  const cryptoAssets: CryptoAsset[] = [
    'binanceBuffer',
    'hodl',
    'defi',
    'defi2',
    'backed',
  ];
  const assets = [...fixedAssets, ...stockAssets, ...cryptoAssets];
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
      const fixedValues = flattenBalance(balance.fixed.balance, totalRow);
      const stockValues = flattenBalance(balance.stock.balance, totalRow);
      const cryptoValues = flattenBalance(balance.crypto.balance, totalRow);

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
