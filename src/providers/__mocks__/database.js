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

  // TODO update to support multiple updates
  const [updateKey, updateValue] = Object.entries(update['$set'])[0];

  _.set(record, updateKey, updateValue);
  setData(databaseName, collectionName, data);
};

const resetMockValues = () => (dataBuffer = {});

export default {
  connect,
  find,
  updateOne,
  resetMockValues,
};
