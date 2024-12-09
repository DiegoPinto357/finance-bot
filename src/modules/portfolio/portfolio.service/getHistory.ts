import database from '../../../providers/database';

export default async () => {
  const data = await database.find(
    'portfolio',
    'history',
    {},
    {
      projection: { _id: 0 },
    }
  );
  return data;
};
