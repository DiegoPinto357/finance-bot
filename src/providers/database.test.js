import { MongoClient, instance } from 'mongodb';
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
});
