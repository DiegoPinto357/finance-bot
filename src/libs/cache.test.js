import { withCache, clearCache } from './cache';

describe('cache', () => {
  it('caches a function call', async () => {
    let iteration = 0;
    const func = async param => {
      return new Promise(resolve => {
        const result =
          iteration === 0
            ? `firstResult - ${param}`
            : `secondResult - ${param}`;
        iteration++;
        resolve(result);
      });
    };

    const param = 'param';
    const firstResult = await withCache(param, () => func(param));
    const cachedResult = await withCache(param, () => func(param));

    clearCache();

    const secondResult = await withCache(param, () => func(param));

    expect(firstResult).toBe('firstResult - param');
    expect(cachedResult).toBe('firstResult - param');
    expect(secondResult).toBe('secondResult - param');
  });
});
