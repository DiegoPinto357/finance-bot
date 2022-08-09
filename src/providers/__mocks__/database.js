import { promises as fs } from 'fs';
import path from 'path';
import _ from 'lodash';

const mockDir = `${path.resolve()}/mockData/database/`;

const connect = jest.fn();

let dataBuffer = {};

const getData = async (databaseName, collectionName) => {
  const filename = path.join(mockDir, databaseName, `${collectionName}.json`);

  if (!dataBuffer[filename]) {
    dataBuffer[filename] = JSON.parse(await fs.readFile(filename, 'utf-8'));
  }

  return dataBuffer[filename];
};

const find = jest.fn(async (databaseName, collectionName, query, options) => {
  const data = await getData(databaseName, collectionName);

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

const updateOne = async (
  databaseName,
  collectionName,
  query,
  update,
  options
) => {
  const data = await getData(databaseName, collectionName);

  // TODO update to support multiple queries
  const [queryKey, queryValue] = Object.entries(query)[0];

  const record = data.find(item => item[queryKey] === queryValue);

  // TODO update to support multiple updates
  const [updateKey, updateValue] = Object.entries(update['$set'])[0];

  _.set(record, updateKey, updateValue);
};

const resetMockValues = () => (dataBuffer = {});

export default {
  connect,
  find,
  updateOne,
  resetMockValues,
};
