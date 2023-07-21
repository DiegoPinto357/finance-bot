import database from '../../../providers/database';

export default () =>
  database.find(
    'portfolio',
    'shares',
    {},
    { projection: { _id: 0, shares: 0 } }
  );
