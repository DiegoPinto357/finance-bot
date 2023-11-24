import { promises as fs } from 'fs';
import hash from 'object-hash';
import stringify from 'json-stringify-safe';
import { buildLogger } from './logger';
import config from '../config';

const log = buildLogger('Cache');

const cacheFilename = './.cache/main.json';

interface CacheEntry {
  timestamp: number;
  data: Object;
}

interface StringIndexed {
  [key: string]: CacheEntry;
}

let cache: StringIndexed = {};

const init = async () => {
  log('Loading cache file');
  try {
    const cacheFile = await fs.readFile(cacheFilename, 'utf-8');
    if (cacheFile) {
      cache = JSON.parse(cacheFile);
    }
  } catch (error) {
    log('Cache file does not exists', { severity: 'warn' });
  }
};

const clear = () => (cache = {});

const saveData = async () => {
  log('Saving cache file');
  await fs.writeFile(cacheFilename, stringify(cache, null, 2), 'utf-8');
};

interface Options {
  dataNode?: string;
  timeToLive?: number;
}

export const withCache =
  // TODO use generic type

    (func: (...params: any) => any, options: Options = {}) =>
    async (...params: any) => {
      if (config.cache.disabled) {
        return await func(...params);
      }

      const key = hash({ func, params });
      const cacheEntry = cache[key];
      const { dataNode } = options;

      if (cacheEntry) {
        const now = Date.now();
        const { timestamp } = cacheEntry;
        const timeToLive = options.timeToLive || config.cache.defaultTimeToLive;

        const expired = Boolean(timeToLive) && timestamp + timeToLive < now;
        if (!expired) {
          return dataNode ? { [dataNode]: cacheEntry.data } : cacheEntry.data;
        }
      }

      try {
        const result = await func(...params);
        const data = dataNode ? result[dataNode] : result;
        cache[key] = { data, timestamp: Date.now() };
        return result;
      } catch (error) {
        if (cacheEntry) {
          // TODO identify function
          log(`Error calling function. Loading stale cache.`, {
            severity: 'warn',
          });
          return dataNode ? { [dataNode]: cacheEntry.data } : cacheEntry.data;
        }
        throw error;
      }
    };

export default {
  init,
  clear,
  saveData,
};
