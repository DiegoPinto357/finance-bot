import 'dotenv/config';
import { query } from 'express';
import { MongoClient } from 'mongodb';

const dbPassword = process.env.MONGODB_PASSWORD;
const url = `mongodb+srv://finance-bot-admin:${dbPassword}@finance-bot.24mvojo.mongodb.net/test`;
const client = new MongoClient(url);

async function main() {
  await client.connect();
  console.log('Connected successfully to server');
  const db = client.db('finance-bot');
  const collection = db.collection('fixed');

  const query = {};
  const options = { projection: { _id: 0, asset: 1 } };

  const data = await collection.find(query, options).toArray();
  console.log(data);

  return 'done.';
}

main()
  .then(console.log)
  .catch(console.error)
  .finally(() => client.close());
