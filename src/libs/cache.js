import hash from 'object-hash';

let cache = {};

export const withCache =
  func =>
  async (...params) => {
    const key = hash({ func, params });
    const cacheData = cache[key];

    if (cacheData) {
      return Promise.resolve({ data: cacheData });
    }

    const result = await func(...params);
    cache[key] = result.data;
    return result;
  };

export const clearCache = () => (cache = {});
