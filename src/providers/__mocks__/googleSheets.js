import { promises as fs } from 'fs';
import path from 'path';

const mockDir = `${path.resolve()}/mockData/googleSheets/`;

const loadSheet = jest.fn(async sheetTitle => {
  const filename = `${mockDir}${sheetTitle}.json`;
  return JSON.parse(await fs.readFile(filename, 'utf-8'));
});

export default {
  loadSheet,
};
