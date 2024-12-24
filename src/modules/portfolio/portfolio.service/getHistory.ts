import database from '../../../providers/database';

import type { PortfolioHistoryEntry } from './types';

export default async () => {
  const data = await database.find<PortfolioHistoryEntry[]>(
    'portfolio',
    'history',
    {},
    {
      projection: { _id: 0 },
      sort: { date: 1 },
    }
  );
  return data;
};
