import { withCache, clearCache } from './cache';

jest.useFakeTimers();

const minute = 60 * 1000;
jest.mock('../config', () => ({
  cache: { defaultTimeToLive: 5 * minute },
}));

describe('cache', () => {
  beforeEach(() => {
    jest.resetModules();
    clearCache();
  });

  it('caches a function call with params', async () => {
    let iteration = 0;
    const func = async (a, b) => {
      return new Promise(resolve => {
        const result =
          iteration === 0
            ? `firstResult - ${a}, ${b}`
            : `secondResult - ${a}, ${b}`;
        iteration++;
        resolve(result);
      });
    };

    const funcCached = withCache(func);

    const firstResult = await funcCached('param1', 'param2');
    const cachedResult = await funcCached('param1', 'param2');

    clearCache();

    const secondResult = await funcCached('param1', 'param2');

    expect(firstResult).toBe('firstResult - param1, param2');
    expect(cachedResult).toBe('firstResult - param1, param2');
    expect(secondResult).toBe('secondResult - param1, param2');
  });

  it('caches a function call with params from a provided data node', async () => {
    let iteration = 0;
    const func = async (a, b) => {
      return new Promise(resolve => {
        const result =
          iteration === 0
            ? `firstResult - ${a}, ${b}`
            : `secondResult - ${a}, ${b}`;
        iteration++;
        resolve({ data: result });
      });
    };

    const funcCached = withCache(func, { dataNode: 'data' });

    const { data: firstResult } = await funcCached('param1', 'param2');
    const { data: cachedResult } = await funcCached('param1', 'param2');

    clearCache();

    const { data: secondResult } = await funcCached('param1', 'param2');

    expect(firstResult).toBe('firstResult - param1, param2');
    expect(cachedResult).toBe('firstResult - param1, param2');
    expect(secondResult).toBe('secondResult - param1, param2');
  });

  it('caches multiple function calls without params', async () => {
    const func1 = async () => Promise.resolve('func1Result');
    const func2 = async () => Promise.resolve('func2Result');

    const func1Cached = withCache(func1);
    const func2Cached = withCache(func2);

    const result1 = await func1Cached();
    const result2 = await func2Cached();

    expect(result1).toBe('func1Result');
    expect(result2).toBe('func2Result');
  });

  it('does not caches function if disable config is true', async () => {
    jest.mock('../config', () => ({
      cache: { disabled: true },
    }));

    const cache = require('./cache');

    let iteration = 0;
    const func = async (a, b) => {
      return new Promise(resolve => {
        const result =
          iteration === 0
            ? `firstResult - ${a}, ${b}`
            : `secondResult - ${a}, ${b}`;
        iteration++;
        resolve(result);
      });
    };

    const funcCached = cache.withCache(func);

    const firstResult = await funcCached('param1', 'param2');
    const secondResult = await funcCached('param1', 'param2');

    expect(firstResult).toBe('firstResult - param1, param2');
    expect(secondResult).toBe('secondResult - param1, param2');
  });

  describe('timeToLive', () => {
    let iteration;
    const func = async (a, b) => {
      return new Promise(resolve => {
        const result =
          iteration === 0
            ? `firstResult - ${a}, ${b}`
            : `secondResult - ${a}, ${b}`;
        iteration++;
        resolve(result);
      });
    };

    beforeEach(() => (iteration = 0));

    it('assumes default "time to live" value whe it is not provided', async () => {
      const funcCached = withCache(func);

      const firstResult = await funcCached('param1', 'param2');
      jest.advanceTimersByTime(3 * minute);
      const cachedResult = await funcCached('param1', 'param2');
      jest.advanceTimersByTime(3 * minute);
      const secondResult = await funcCached('param1', 'param2');

      expect(firstResult).toBe('firstResult - param1, param2');
      expect(cachedResult).toBe('firstResult - param1, param2');
      expect(secondResult).toBe('secondResult - param1, param2');
    });

    it('does not return cached value after "time to live" has been passed', async () => {
      const funcCached = withCache(func, { timeToLive: 10 });

      const firstResult = await funcCached('param1', 'param2');
      jest.advanceTimersByTime(20);
      const secondResult = await funcCached('param1', 'param2');
      const cachedResult = await funcCached('param1', 'param2');

      expect(firstResult).toBe('firstResult - param1, param2');
      expect(secondResult).toBe('secondResult - param1, param2');
      expect(cachedResult).toBe('secondResult - param1, param2');
    });

    it('returns cached value wehn "time to live" has not been passed', async () => {
      const funcCached = withCache(func, { timeToLive: 10 });

      const firstResult = await funcCached('param1', 'param2');
      jest.advanceTimersByTime(5);
      const cachedResult = await funcCached('param1', 'param2');

      expect(firstResult).toBe('firstResult - param1, param2');
      expect(cachedResult).toBe('firstResult - param1, param2');
    });
  });
});
