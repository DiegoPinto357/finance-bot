import database from '../../../providers/database';
import getBalance from './getBalance';
import { BalanceByPortfolio } from './types';

import type { PortfolioHistoryEntry } from './types';
import type { Portfolio } from '../../../schemas';

const portfoliosToExclude = ['mae', 'leni'];

const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const mapPortfolioBalance = (balance: BalanceByPortfolio) =>
  Object.entries(balance).reduce((data, [key, value]) => {
    if (portfoliosToExclude.includes(key)) return data;
    data[key as Portfolio] = value.total;
    return data;
  }, {} as PortfolioHistoryEntry['portfolios']);

export default async () => {
  const date = getCurrentDate();
  const { balance } = await getBalance();
  const portfolios = mapPortfolioBalance(balance);
  await database.insertOne('portfolio', 'history', { date, portfolios });
};
