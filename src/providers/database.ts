import {
  Collection,
  Db,
  MongoClient,
  Filter,
  FindOptions,
  UpdateFilter,
  UpdateOptions,
  AnyBulkWriteOperation,
  BulkWriteOptions,
} from 'mongodb';
import moment from 'moment';
import { buildLogger } from '../libs/logger';

const debugMode = false;
const verboseMode = false;

const log = buildLogger('Database');

if (debugMode) {
  log('Debug mode enabled', { severity: 'warn' });
}

const dbPassword = process.env.MONGODB_PASSWORD;
const url = `mongodb+srv://finance-bot-admin:${dbPassword}@finance-bot.24mvojo.mongodb.net`;
const client = new MongoClient(url);

const connect = async () => {
  await client.connect();
  log('Connected to MongoDB');
};

const close = () => {
  client.close();
  log('MongoDB connection closed');
};

const saveBackup = async <Schema>(
  db: Db,
  collection: Collection,
  collectionName: string,
  filter: Filter<Schema>
) => {
  // @ts-ignore
  const { _id, ...actualDocument } = await collection.findOne<Schema>(filter);
  // const actualDocument = await collection.findOne<Schema>(filter);
  const backupCollection = db.collection(`${collectionName}-backup`);
  const createdAt = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
  await backupCollection.insertOne({
    ...actualDocument,
    createdAt,
  });
};

const find = async <Schema>(
  databaseName: string,
  collectionName: string,
  filter: Filter<Schema>,
  options: FindOptions
) => {
  log(`Findind data on ${databaseName}/${collectionName}`);
  const db = client.db(databaseName);
  const collection = db.collection(collectionName);
  return (await collection.find(filter, options).toArray()) as Schema;
};

const findOne = async <Schema>(
  databaseName: string,
  collectionName: string,
  filter: Filter<Schema>,
  options: FindOptions
) => {
  log(`Findind data on ${databaseName}/${collectionName}`);
  const db = client.db(databaseName);
  const collection = db.collection(collectionName);
  return (await collection.findOne(filter, options)) as Schema;
};

const updateOne = async <Schema>(
  databaseName: string,
  collectionName: string,
  filter: Filter<Schema>,
  update: UpdateFilter<Schema>,
  options: UpdateOptions
) => {
  log(`Updating document on ${databaseName}/${collectionName}`);

  if (debugMode || verboseMode) {
    console.dir(
      { databaseName, collectionName, filter, update, options },
      { depth: null }
    );
  }
  if (debugMode) return;

  const db = client.db(databaseName);
  const collection = db.collection(collectionName);

  await saveBackup(db, collection, collectionName, filter);

  return await collection.updateOne(filter, update, options);
};

const deleteOne = async <Schema>(
  databaseName: string,
  collectionName: string,
  filter: Filter<Schema>
) => {
  log(`Deleting document on ${databaseName}/${collectionName}`);

  if (debugMode || verboseMode) {
    console.dir({ databaseName, collectionName, filter }, { depth: null });
  }
  if (debugMode) return;

  const db = client.db(databaseName);
  const collection = db.collection(collectionName);

  await saveBackup(db, collection, collectionName, filter);

  return await collection.deleteOne(filter);
};

/**
 * @deprecated Moved to schemas file for runtime schema validation
 */
const bulkWrite = async <Schema extends Document>(
  databaseName: string,
  collectionName: string,
  operations: AnyBulkWriteOperation<Schema>[],
  options: BulkWriteOptions
) => {
  log(`Bulk writing on ${databaseName}/${collectionName}`);

  if (debugMode) return;

  const db = client.db(databaseName);
  const collection = db.collection(collectionName);
  // @ts-ignore
  // TODO add backup
  return await collection.bulkWrite(operations, options);
};

export default {
  connect,
  close,
  find,
  findOne,
  updateOne,
  deleteOne,
  bulkWrite,
};
