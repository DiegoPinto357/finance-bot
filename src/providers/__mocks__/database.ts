import { promises as fs } from 'fs';
import path from 'path';
import _ from 'lodash';
import { Filter, UpdateFilter, UpdateOptions } from 'mongodb';

const mockDir = `${path.resolve()}/mockData/database/`;

const connect = jest.fn();

interface StringIndexed {
  [key: string]: any;
}

let dataBuffer: StringIndexed = {};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getData = async (databaseName: string, collectionName: string) => {
  const filename = path.join(mockDir, databaseName, `${collectionName}.json`);

  if (!dataBuffer[filename]) {
    dataBuffer[filename] = JSON.parse(await fs.readFile(filename, 'utf-8'));
  }

  return _.cloneDeep(dataBuffer[filename]);
};

const setData = (
  databaseName: string,
  collectionName: string,
  data: Object
) => {
  const filename = path.join(mockDir, databaseName, `${collectionName}.json`);
  dataBuffer[filename] = _.cloneDeep(data);
};

const find = jest.fn(async (databaseName, collectionName, query, options) => {
  const data = await getData(databaseName, collectionName);

  const filteredData = [
    ...data.filter((item: StringIndexed) =>
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

const findOne = jest.fn(
  async (databaseName, collectionName, query, options) => {
    const result = await find(databaseName, collectionName, query, options);
    return result[0];
  }
);

const updateOne = async <Schema>(
  databaseName: string,
  collectionName: string,
  filter: Filter<Schema>,
  update: UpdateFilter<Schema>,
  options: UpdateOptions = {}
) => {
  const data = await getData(databaseName, collectionName);

  let record = data.find((item: StringIndexed) =>
    Object.entries(filter).every(([key, value]) => item[key] === value)
  );

  const { upsert } = options;

  if (!record) {
    if (!upsert) {
      return { matchedCount: 0 };
    }

    record = {};
    data.push(record);
  }

  const operations = Object.entries(update);
  operations.forEach(([operation, params]) => {
    Object.entries(params).forEach(([key, value]) => {
      switch (operation) {
        case '$set':
          _.set(record, key, value);
          break;

        case '$inc':
          const currentValue = _.get(record, key);
          _.set(record, key, currentValue + value);
          break;

        case '$setOnInsert':
          if (upsert) {
            _.set(record, key, value);
          }
          break;
      }
    });
  });

  await delay(1);
  setData(databaseName, collectionName, data);
  return { matchedCount: 1 };
};

const deleteOne = async <Schema>(
  databaseName: string,
  collectionName: string,
  filter: Filter<Schema>
) => {
  const data = await getData(databaseName, collectionName);

  const record = data.find((item: StringIndexed) =>
    Object.entries(filter).every(([key, value]) => item[key] === value)
  );

  if (!record) {
    return { matchedCount: 0 };
  }

  const recordIndex = data.indexOf(record);
  data.splice(recordIndex, 1);

  await delay(1);
  setData(databaseName, collectionName, data);
  return { matchedCount: 1 };
};

const resetMockValues = () => (dataBuffer = {});

export default {
  connect,
  find,
  findOne,
  updateOne,
  deleteOne,
  resetMockValues,
};
