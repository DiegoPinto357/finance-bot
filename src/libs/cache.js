import hash from 'object-hash';

let cache = {};

export const withCache =
  (func, options = {}) =>
  async (...params) => {
    const key = hash({ func, params });
    const cacheEntry = cache[key];

    if (cacheEntry) {
      const now = Date.now();
      const { timestamp } = cacheEntry;
      const { timeToLive } = options;

      const expired = Boolean(timeToLive) && timestamp + timeToLive < now;
      if (!expired) {
        return { data: cacheEntry.data };
      }
    }

    const result = await func(...params);
    cache[key] = { data: result.data, timestamp: Date.now() };
    return result;
  };

export const clearCache = () => (cache = {});
