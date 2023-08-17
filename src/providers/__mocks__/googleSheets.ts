import { promises as fs } from 'fs';
import path from 'path';

const mockDir = `${path.resolve()}/mockData/googleSheets/`;

type Row = Record<string, unknown>;

let dataBuffer: Record<string, Row[]> = {};

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

const resetMockValues = () => (dataBuffer = {});

export default {
  loadSheet,
  resetMockValues,
};
