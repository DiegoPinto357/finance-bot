import { promises as fs } from 'fs';

export const loadFile = async filename =>
  JSON.parse(await fs.readFile(filename, 'utf-8'));

export const saveFile = (filename, data) =>
  fs.writeFile(filename, JSON.stringify(data, null, 2), 'utf-8');
