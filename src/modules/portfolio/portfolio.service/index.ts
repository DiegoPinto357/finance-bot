import getBalance from './getBalance';
import getShares from './getShares';
import getLiquidity from './getLiquidity';
import deposit from './deposit';
import transfer from './transfer';
export { transferSchema } from './transfer';
import swap from './swap';
import moveToPortfolio from './moveToPortfolio';
import distribute from './distribute';
import getAssets from './getAssets';
import removeAsset from './removeAsset';
import getPortfolios from './getPortfolios';
import updateAbsoluteTable from './updateAbsoluteTable';
import updateSharesDiffTable from './updateSharesDiffTable';
import updateTables from './updateTables';

import type { Portfolio } from '../../../types';

export type PortfolioName = Portfolio;

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
  updateAbsoluteTable,
  updateSharesDiffTable,
  updateTables,
};
