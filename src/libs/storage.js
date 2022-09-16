import { promises as fs } from 'fs';
import JSON5 from 'json5';

export const loadFile = async filename =>
  JSON5.parse(await fs.readFile(filename, 'utf-8'));

export const saveFile = (filename, data) =>
  fs.writeFile(filename, JSON5.stringify(data, null, 2), 'utf-8');
