import { promises as fs } from 'fs';
import path from 'path';

const mockDir = `${path.resolve()}/mockData/database/`;

const connect = jest.fn();

const find = jest.fn(async (databaseName, collectionName, query, options) => {
  const filename = path.join(mockDir, databaseName, `${collectionName}.json`);
  const data = JSON.parse(await fs.readFile(filename, 'utf-8'));

  const filteredData = [
    ...data.filter(item =>
      Object.entries(query).every(([key, value]) => item[key] === value)
    ),
  ];

  const { projection } = options;

  return filteredData.map(item => {
    const projectionEntries = Object.entries(projection);
    projectionEntries.forEach(([key, value]) => {
      if (value === 0) {
        delete item[key];
      }
    });
    return { ...item };
  });
});

export default {
  connect,
  find,
};
