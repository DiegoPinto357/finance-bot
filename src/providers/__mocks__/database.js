import { promises as fs } from 'fs';
import path from 'path';

const mockDir = `${path.resolve()}/mockData/database/`;

let dataBuffer = {};

const connect = jest.fn();

const find = jest.fn(async (databaseName, collectionName) => {
  const filename = path.join(mockDir, databaseName, `${collectionName}.json`);

  if (!dataBuffer[databaseName]) {
    dataBuffer[databaseName] = {};
    dataBuffer[databaseName][collectionName] = JSON.parse(
      await fs.readFile(filename, 'utf-8')
    );
  }

  if (!dataBuffer?.[databaseName][collectionName]) {
    dataBuffer[databaseName][collectionName] = JSON.parse(
      await fs.readFile(filename, 'utf-8')
    );
  }

  return dataBuffer[databaseName][collectionName];
});

export default {
  connect,
  find,
};
