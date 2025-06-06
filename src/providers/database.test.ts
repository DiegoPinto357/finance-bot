import * as mongodb from 'mongodb';
import _ from 'lodash';
import database from './database';
import portfolioShares from '../../mockData/database/portfolio/shares.json';

jest.mock('mongodb');

jest.useFakeTimers().setSystemTime(new Date('2020-01-01T10:24:05.357-03:00'));

type MongoDBMock = typeof mongodb & {
  instance: { connect: () => void };
  mockDbFn: () => void;
  mockCollectionFn: () => void;
  mockFindFn: () => void;
  mockFindOneFn: jest.Mock;
  mockInsertOneFn: () => void;
  mockToArrayFn: () => void;
  mockUpdateOneFn: () => void;
  mockDeleteOneFn: () => void;
  mockBulkWriteFn: () => void;
};

const {
  MongoClient,
  instance,
  mockDbFn,
  mockCollectionFn,
  mockFindFn,
  mockFindOneFn,
  mockInsertOneFn,
  mockToArrayFn,
  mockUpdateOneFn,
  mockDeleteOneFn,
  mockBulkWriteFn,
} = mongodb as MongoDBMock;

describe('database', () => {
  beforeEach(() =>
    mockFindOneFn.mockResolvedValue({
      _id: '62d36b150ef9ecf5cd14df91',
    })
  );

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

  it('finds a single document from collection', async () => {
    const databaseName = 'assets';
    const collectionName = 'fixed';
    const query = {};
    const options = { projection: { _id: 0, asset: 1 } };

    await database.findOne(databaseName, collectionName, query, options);

    expect(mockDbFn).toBeCalledTimes(1);
    expect(mockDbFn).toBeCalledWith(databaseName);

    expect(mockCollectionFn).toBeCalledTimes(1);
    expect(mockCollectionFn).toBeCalledWith(collectionName);

    expect(mockFindOneFn).toBeCalledTimes(1);
    expect(mockFindOneFn).toBeCalledWith(query, options);
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

    expect(mockCollectionFn).toBeCalledWith(collectionName);

    expect(mockUpdateOneFn).toBeCalledTimes(1);
    expect(mockUpdateOneFn).toBeCalledWith(query, update, options);
  });

  it('deletes a single document', async () => {
    const databaseName = 'assets';
    const collectionName = 'fixed';
    const query = { asset: 'nubank' };

    await database.deleteOne(databaseName, collectionName, query);

    expect(mockDbFn).toBeCalledTimes(1);
    expect(mockDbFn).toBeCalledWith(databaseName);

    expect(mockCollectionFn).toBeCalledWith(collectionName);

    expect(mockDeleteOneFn).toBeCalledTimes(1);
    expect(mockDeleteOneFn).toBeCalledWith(query);
  });

  it('inserts a single document', async () => {
    const databaseName = 'portfolio';
    const collectionName = 'history';
    const document = {
      date: '2024-12-23',
      portfolios: {
        amortecedor: 12194.64,
        financiamento: 29380.02,
        suricat: 20292.96,
      },
    };

    await database.insertOne(databaseName, collectionName, document);

    expect(mockDbFn).toBeCalledTimes(1);
    expect(mockDbFn).toBeCalledWith(databaseName);

    expect(mockCollectionFn).toBeCalledWith(collectionName);

    expect(mockInsertOneFn).toBeCalledTimes(1);
    expect(mockInsertOneFn).toBeCalledWith(document);
  });

  // FIXME this test makes jest freeze
  // it('bulk writes operarions', async () => {
  //   const databaseName = 'assets';
  //   const collectionName = 'fixed';
  //   const operations = [
  //     {
  //       updateOne: {
  //         filter: { asset: 'nubank' },
  //         update: { $set: { value: 357 } },
  //       },
  //     },
  //     {
  //       updateOne: {
  //         filter: { asset: 'iti' },
  //         update: { $set: { value: 100 } },
  //       },
  //     },
  //     {
  //       updateOne: {
  //         filter: { asset: 'inco' },
  //         update: { $set: { value: 1000 } },
  //       },
  //     },
  //   ];
  //   const options = { ordered: false };
  //   await database.bulkWrite(databaseName, collectionName, operations, options);
  //   expect(mockDbFn).toBeCalledTimes(1);
  //   expect(mockDbFn).toBeCalledWith(databaseName);
  //   expect(mockCollectionFn).toBeCalledTimes(1);
  //   expect(mockCollectionFn).toBeCalledWith(collectionName);
  //   expect(mockBulkWriteFn).toBeCalledTimes(1);
  //   expect(mockBulkWriteFn).toBeCalledWith(operations, options);
  // });

  describe('backup', () => {
    it('saves a document copy before updateOne', async () => {
      const databaseName = 'portfolios';
      const collectionName = 'shares';
      const asset = { assetClass: 'fixed', assetName: 'nubank' };

      const currentData = portfolioShares.find(
        ({ assetName }) => assetName === asset.assetName
      );
      mockFindOneFn.mockResolvedValue({
        ...currentData,
        _id: '62d36b150ef9ecf5cd14df91',
      });

      const newData = _.cloneDeep(currentData);
      if (newData) newData.shares[1].value = 0.15;

      const update = { $set: { shares: newData?.shares } };
      const options = { upsert: true };

      await database.updateOne(
        databaseName,
        collectionName,
        asset,
        update,
        options
      );

      const backupDocument = {
        ...currentData,
        _id: undefined,
        createdAt: '2020-01-01T10:24:05.357',
      };

      expect(mockDbFn).toBeCalledTimes(1);
      expect(mockDbFn).toBeCalledWith(databaseName);

      expect(mockCollectionFn).toBeCalledTimes(2);
      expect(mockCollectionFn).toBeCalledWith(collectionName);
      expect(mockCollectionFn).toBeCalledWith(`${collectionName}-backup`);

      expect(mockInsertOneFn).toBeCalledTimes(1);
      expect(mockInsertOneFn).toBeCalledWith(backupDocument);
    });

    it('saves a document copy before deleteOne', async () => {
      const databaseName = 'portfolios';
      const collectionName = 'shares';
      const asset = { assetClass: 'fixed', assetName: 'nubank' };

      const currentData = portfolioShares.find(
        ({ assetName }) => assetName === asset.assetName
      );
      mockFindOneFn.mockResolvedValue({
        ...currentData,
        _id: '62d36b150ef9ecf5cd14df91',
      });

      await database.deleteOne(databaseName, collectionName, asset);

      const backupDocument = {
        ...currentData,
        _id: undefined,
        createdAt: '2020-01-01T10:24:05.357',
      };

      expect(mockDbFn).toBeCalledTimes(1);
      expect(mockDbFn).toBeCalledWith(databaseName);

      expect(mockCollectionFn).toBeCalledTimes(2);
      expect(mockCollectionFn).toBeCalledWith(collectionName);
      expect(mockCollectionFn).toBeCalledWith(`${collectionName}-backup`);

      expect(mockInsertOneFn).toBeCalledTimes(1);
      expect(mockInsertOneFn).toBeCalledWith(backupDocument);
    });
  });
});
