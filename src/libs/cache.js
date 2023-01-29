import hash from 'object-hash';
import config from '../config';

let cache = {};

export const withCache =
  (func, options = {}) =>
  async (...params) => {
    if (config.cache.disabled) {
      return await func(...params);
    }

    const key = hash({ func, params });
    const cacheEntry = cache[key];
    const { dataNode, errorHandler } = options;

    if (cacheEntry) {
      const now = Date.now();
      const { timestamp } = cacheEntry;
      const timeToLive = options.timeToLive || config.cache.defaultTimeToLive;

      const expired = Boolean(timeToLive) && timestamp + timeToLive < now;
      if (!expired) {
        return dataNode ? { [dataNode]: cacheEntry.data } : cacheEntry.data;
      }
    }

    const result = await func(...params);
    const hasError = errorHandler ? errorHandler(result) : false;

    if (!hasError) {
      const data = dataNode ? result[dataNode] : result;
      cache[key] = { data, timestamp: Date.now() };
    } else if (cacheEntry) {
      return dataNode ? { [dataNode]: cacheEntry.data } : cacheEntry.data;
    }

    return result;
  };

export const clearCache = () => (cache = {});
