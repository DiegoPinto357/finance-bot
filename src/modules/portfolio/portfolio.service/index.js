import googleSheets from '../../../providers/googleSheets';

import { services } from './common';

import getBalance from './getBalance';
import getShares from './getShares';
import getLiquidity from './getLiquidity';
import deposit from './deposit';
import transfer from './transfer';
import swap from './swap';
import moveToPortfolio from './moveToPortfolio';
import distribute from './distribute';
import getAssets from './getAssets';
import removeAsset from './removeAsset';
import getPortfolios from './getPortfolios';

const flattenBalance = (balance, totals) =>
  balance.reduce((values, { asset, value }) => {
    values[asset] = value;
    totals[asset] = totals[asset] + value;
    return values;
  }, {});

const updateAbsoluteTable = async () => {
  const fixedAssets = await services['fixed'].getAssetsList();
  const stockAssets = ['float', 'br', 'fii', 'us'];
  const cryptoAssets = ['binanceBuffer', 'hodl', 'defi', 'defi2', 'backed'];
  const assets = [...fixedAssets, ...stockAssets, ...cryptoAssets];
  const header = ['portfolios', ...assets, 'total'];

  const { balance } = await getBalance();

  const totalRow = assets.reduce(
    (totalRow, asset) => {
      totalRow[asset] = 0;
      return totalRow;
    },
    { portfolios: 'total', total: 0 }
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

const updateSharesDiffTable = async () => {
  const { shares: portfolios } = await getShares();

  const header = ['portfolios'];

  const rows = portfolios.map(({ shares, portfolio }) => {
    const row = [portfolio];
    shares.forEach(share => {
      const { assetClass, asset, diffBRL } = share;
      const headerLabel = asset || assetClass;
      const colIndex = header.indexOf(headerLabel);

      if (colIndex !== -1) {
        row[colIndex] = -diffBRL;
      } else {
        row[header.length] = -diffBRL;
        header.push(headerLabel);
      }
    });

    return row;
  });

  await googleSheets.setSheet('portfolio-shares-diff', header, rows);
};

const updateTables = () =>
  Promise.all([updateAbsoluteTable(), updateSharesDiffTable()]);

export default {
  getBalance,
  getShares,
  getLiquidity,
  deposit,
  transfer,
  swap,
  moveToPortfolio,
  distribute,
  getAssets,
  removeAsset,
  getPortfolios,

  // debug/dev
  updateAbsoluteTable,
  updateSharesDiffTable,
  updateTables,
};
