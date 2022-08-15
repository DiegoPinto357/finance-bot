import { MongoClient } from 'mongodb';
import { buildLogger } from '../libs/logger';

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

const find = async (databaseName, collectionName, query, options) => {
  log(`Findind data on ${databaseName}/${collectionName}`);
  const db = client.db(databaseName);
  const collection = db.collection(collectionName);
  return await collection.find(query, options).toArray();
};

const updateOne = async (databaseName, collectionName, query, update) => {
  log(`Updating document on ${databaseName}/${collectionName}`);
  const db = client.db(databaseName);
  const collection = db.collection(collectionName);
  await collection.updateOne(query, update);
};

export default {
  connect,
  close,
  find,
  updateOne,
};
