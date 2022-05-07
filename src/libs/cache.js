import hash from 'object-hash';

let cache = {};

export const withCache = async (params, callback) => {
  const key = hash(params);
  const cacheData = cache[key];

  if (cacheData) {
    return Promise.resolve(cacheData);
  }

  const result = await callback();
  cache[key] = result;
  return result;
};

export const clearCache = () => (cache = {});
