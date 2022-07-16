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

export default {
  connect,
};
