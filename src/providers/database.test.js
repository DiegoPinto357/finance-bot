import {
  MongoClient,
  instance,
  mockDbFn,
  mockCollectionFn,
  mockFindFn,
  mockToArrayFn,
} from 'mongodb';
import database from './database';

jest.mock('mongodb');

describe('database', () => {
  it('configs mongodb client on start', () => {
    const dbPassword = process.env.MONGODB_PASSWORD;
    const expectedURL = `mongodb+srv://finance-bot-admin:${dbPassword}@finance-bot.24mvojo.mongodb.net`;
    expect(MongoClient).toBeCalledTimes(1);
    expect(MongoClient).toBeCalledWith(expectedURL);
  });

  it('connects to mongodb server', async () => {
    await database.connect();
    expect(instance.connect).toBeCalledTimes(1);
  });

  it('finds data from collection', async () => {
    const databaseName = 'assets';
    const collectionName = 'fixed';
    const query = {};
    const options = { projection: { _id: 0, asset: 1 } };

    await database.find(databaseName, collectionName, query, options);

    expect(mockDbFn).toBeCalledTimes(1);
    expect(mockDbFn).toBeCalledWith(databaseName);

    expect(mockCollectionFn).toBeCalledTimes(1);
    expect(mockCollectionFn).toBeCalledWith(collectionName);

    expect(mockFindFn).toBeCalledTimes(1);
    expect(mockFindFn).toBeCalledWith(query, options);

    expect(mockToArrayFn).toBeCalledTimes(1);
  });
});
