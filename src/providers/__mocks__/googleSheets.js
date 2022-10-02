import { promises as fs } from 'fs';
import path from 'path';

const mockDir = `${path.resolve()}/mockData/googleSheets/`;

let dataBuffer = {};

const loadSheet = jest.fn(async sheetTitle => {
  const filename = `${mockDir}${sheetTitle}.json`;

  if (!dataBuffer[sheetTitle]) {
    try {
      dataBuffer[sheetTitle] = JSON.parse(await fs.readFile(filename, 'utf-8'));
      dataBuffer[sheetTitle] = dataBuffer[sheetTitle].map(row => ({
        ...row,
        save: jest.fn(),
      }));
    } catch (e) {
      return [];
    }
  }

  return dataBuffer[sheetTitle];
});

const writeValue = async (sheetTitle, { index, target }) => {
  const rows = dataBuffer[sheetTitle];
  const rowIndex = rows.findIndex(row => row[index.key] === index.value);
  rows[rowIndex][target.key] = target.value;
  await rows[rowIndex].save();
};

const resetMockValues = () => (dataBuffer = {});

export default {
  loadSheet,
  writeValue,
  resetMockValues,
};
