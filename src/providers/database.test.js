import {
  MongoClient,
  instance,
  mockDbFn,
  mockCollectionFn,
  mockFindFn,
  mockToArrayFn,
  mockUpdateOneFn,
  mockBulkWriteFn,
} from 'mongodb';
import database from './database';

jest.mock('mongodb');

describe('database', () => {
  afterEach(() => jest.clearAllMocks());

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

  it('updates single document', async () => {
    const databaseName = 'assets';
    const collectionName = 'fixed';
    const query = { asset: 'nubank' };
    const update = { $set: { value: 357 } };
    const options = { upsert: true };

    await database.updateOne(
      databaseName,
      collectionName,
      query,
      update,
      options
    );

    expect(mockDbFn).toBeCalledTimes(1);
    expect(mockDbFn).toBeCalledWith(databaseName);

    expect(mockCollectionFn).toBeCalledTimes(1);
    expect(mockCollectionFn).toBeCalledWith(collectionName);

    expect(mockUpdateOneFn).toBeCalledTimes(1);
    expect(mockUpdateOneFn).toBeCalledWith(query, update, options);
  });

  it('bulk writes operarions', async () => {
    const databaseName = 'assets';
    const collectionName = 'fixed';
    const operations = [
      {
        updateOne: {
          filter: { asset: 'nubank' },
          update: { $set: { value: 357 } },
        },
      },
      {
        updateOne: {
          filter: { asset: 'iti' },
          update: { $set: { value: 100 } },
        },
      },
      {
        updateOne: {
          filter: { asset: 'inco' },
          update: { $set: { value: 1000 } },
        },
      },
    ];
    const options = { ordered: false };

    await database.bulkWrite(databaseName, collectionName, operations, options);

    expect(mockDbFn).toBeCalledTimes(1);
    expect(mockDbFn).toBeCalledWith(databaseName);

    expect(mockCollectionFn).toBeCalledTimes(1);
    expect(mockCollectionFn).toBeCalledWith(collectionName);

    expect(mockBulkWriteFn).toBeCalledTimes(1);
    expect(mockBulkWriteFn).toBeCalledWith(operations, options);
  });
});
