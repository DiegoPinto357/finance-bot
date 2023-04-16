const { MongoClient } = require('mongodb');
const moment = require('moment');
const { buildLogger } = require('../libs/logger');

const debugMode = false;
const verboseMode = false;

const log = buildLogger('Database');

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

const saveBackup = async (db, collection, collectionName, filter) => {
  const { _id, ...actualDocument } = await collection.findOne(filter);
  const backupCollection = db.collection(`${collectionName}-backup`);
  const createdAt = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
  await backupCollection.insertOne({
    ...actualDocument,
    createdAt,
  });
};

const find = async (databaseName, collectionName, query, options) => {
  log(`Findind data on ${databaseName}/${collectionName}`);
  const db = client.db(databaseName);
  const collection = db.collection(collectionName);
  return await collection.find(query, options).toArray();
};

const findOne = async (databaseName, collectionName, query, options) => {
  log(`Findind data on ${databaseName}/${collectionName}`);
  const db = client.db(databaseName);
  const collection = db.collection(collectionName);
  return await collection.findOne(query, options);
};

const updateOne = async (
  databaseName,
  collectionName,
  filter,
  update,
  options
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

const deleteOne = async (databaseName, collectionName, filter) => {
  log(`Deleting document on ${databaseName}/${collectionName}`);

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

  return await collection.deleteOne(filter);
};

// TODO add backup
const bulkWrite = async (databaseName, collectionName, operations, options) => {
  log(`Bulk writing on ${databaseName}/${collectionName}`);
  const db = client.db(databaseName);
  const collection = db.collection(collectionName);
  return await collection.bulkWrite(operations, options);
};

module.exports = {
  connect,
  close,
  find,
  findOne,
  updateOne,
  deleteOne,
  bulkWrite,
};
