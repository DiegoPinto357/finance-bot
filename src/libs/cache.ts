import { promises as fs } from 'fs';
import hash from 'object-hash';
import stringify from 'json-stringify-safe';
import _ from 'lodash';
import { buildLogger } from './logger';
import { isErrnoException } from './errorhandling';
import config from '../config';

const log = buildLogger('Cache');

const cacheDirectory = './.cache/';
const cacheFilename = `${cacheDirectory}main.json`;

type CacheEntry = {
  timestamp: number;
  data: Object;
};

type StringIndexed = {
  [key: string]: CacheEntry;
};

let cache: StringIndexed = {};

const createCacheFile = async () => {
  log('Creating new cache file');
  await fs.mkdir(cacheDirectory, { recursive: true });
  await fs.writeFile(cacheFilename, JSON.stringify({}), 'utf-8');
};

const init = async () => {
  log('Loading cache file');
  try {
    const cacheFile = await fs.readFile(cacheFilename, 'utf-8');
    if (cacheFile) {
      cache = JSON.parse(cacheFile);
    }
  } catch (error) {
    if (isErrnoException(error) && error.code === 'ENOENT') {
      log('Cache file not found', { severity: 'warn' });
      await createCacheFile();
    } else console.error(error);
  }
};

const clear = () => (cache = {});

const saveData = async () => {
  log('Saving cache file');
  await fs.writeFile(cacheFilename, stringify(cache, null, 2), 'utf-8');
};

type Options = {
  dataNode?: string;
  requiredFields?: string[];
  timeToLive?: number;
};

export const withCache =
  <F extends (...params: any[]) => any>(func: F, options: Options = {}) =>
  async <T extends Awaited<ReturnType<F>>>(
    ...params: Parameters<F>
  ): Promise<T> => {
    if (config.cache.disabled) {
      return await func(...params);
    }

    const key = hash({ func, params });
    const cacheEntry = cache[key];
    const { dataNode, requiredFields } = options;

    if (cacheEntry) {
      const now = Date.now();
      const { timestamp } = cacheEntry;
      const timeToLive = options.timeToLive || config.cache.defaultTimeToLive;

      const expired = Boolean(timeToLive) && timestamp + timeToLive < now;
      if (!expired) {
        return Promise.resolve(
          dataNode
            ? ({ [dataNode]: cacheEntry.data } as T)
            : (cacheEntry.data as T)
        );
      }
    }

    try {
      const result = await func(...params);
      const data = dataNode ? result[dataNode] : result;

      if (requiredFields) {
        requiredFields.forEach(requiredField => {
          if (_.get(data, requiredField) === undefined) {
            log(`Missing requiredField ${requiredField}.`, {
              severity: 'warn',
            });
            throw new Error(`Missing requiredField ${requiredField}.`);
          }
        });
      }

      cache[key] = { data, timestamp: Date.now() };
      return result;
    } catch (error) {
      if (cacheEntry) {
        // TODO identify function
        log('Error calling function. Loading stale cache.', {
          severity: 'warn',
        });
        return Promise.resolve(
          dataNode
            ? ({ [dataNode]: cacheEntry.data } as T)
            : (cacheEntry.data as T)
        );
      }
      throw error;
    }
  };

export default {
  init,
  clear,
  saveData,
};
