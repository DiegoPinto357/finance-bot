import { promises as fs } from 'fs';
import path from 'path';
import _ from 'lodash';

const mockDir = `${path.resolve()}/mockData/database/`;

const connect = jest.fn();

let dataBuffer = {};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const getData = async (databaseName, collectionName) => {
  const filename = path.join(mockDir, databaseName, `${collectionName}.json`);

  if (!dataBuffer[filename]) {
    dataBuffer[filename] = JSON.parse(await fs.readFile(filename, 'utf-8'));
  }

  return _.cloneDeep(dataBuffer[filename]);
};

const setData = (databaseName, collectionName, data) => {
  const filename = path.join(mockDir, databaseName, `${collectionName}.json`);
  dataBuffer[filename] = _.cloneDeep(data);
};

const find = jest.fn(async (databaseName, collectionName, query, options) => {
  const data = await getData(databaseName, collectionName);

  const filteredData = [
    ...data.filter(item =>
      Object.entries(query).every(([key, value]) => item[key] === value)
    ),
  ];

  const { projection } = options;

  await delay(1);
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

const updateOne = async (databaseName, collectionName, query, update) => {
  const data = await getData(databaseName, collectionName);

  const record = data.find(item =>
    Object.entries(query).every(([key, value]) => item[key] === value)
  );

  if (!record) {
    return { matchedCount: 0 };
  }

  const operations = Object.entries(update);
  operations.forEach(([operation, params]) => {
    // TODO add to support to update multiple key
    const [key, value] = Object.entries(params)[0];
    switch (operation) {
      case '$set':
        _.set(record, key, value);
        break;
      case '$inc':
        const currentValue = _.get(record, key);
        _.set(record, key, currentValue + value);
        break;
    }
  });

  await delay(1);
  setData(databaseName, collectionName, data);
  return { matchedCount: 1 };
};

const resetMockValues = () => (dataBuffer = {});

export default {
  connect,
  find,
  updateOne,
  resetMockValues,
};
