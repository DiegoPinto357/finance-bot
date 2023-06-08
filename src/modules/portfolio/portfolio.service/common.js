import database from '../../../providers/database';

const precision = 0.006;
export const isAround0 = value =>
  value >= 0 - precision && value <= 0 + precision;
export const isAround1 = value =>
  value >= 1 - precision && value <= 1 + precision;
export const isNegative = value => value < -precision;

export const getPortfolioData = (filter = {}) =>
  database.find('portfolio', 'shares', filter, { projection: { _id: 0 } });
