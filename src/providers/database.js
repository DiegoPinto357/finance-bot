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

const find = async (databaseName, collectionName, query, options) => {
  log(`Findind data on ${databaseName}/${collectionName}`);
  const db = client.db(databaseName);
  const collection = db.collection(collectionName);
  return await collection.find(query, options).toArray();
};

export default {
  connect,
  find,
};
