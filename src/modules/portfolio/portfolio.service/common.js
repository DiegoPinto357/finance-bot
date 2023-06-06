import database from '../../../providers/database';

export const getPortfolioData = (filter = {}) =>
  database.find('portfolio', 'shares', filter, { projection: { _id: 0 } });
