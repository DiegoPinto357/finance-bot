import { promises as fs } from 'fs';

export const loadFile = async filename =>
  JSON.parse(await fs.readFile(filename, 'utf-8'));
