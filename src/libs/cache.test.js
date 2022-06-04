import { withCache, clearCache } from './cache';

jest.useFakeTimers();

describe('cache', () => {
  beforeEach(() => clearCache());

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

  it('does not return cached value after "time to live" has been passed', async () => {
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

    const funcCached = withCache(func, { timeToLive: 10 });

    const firstResult = await funcCached('param1', 'param2');
    // await delay(20);
    jest.advanceTimersByTime(20);
    const secondResult = await funcCached('param1', 'param2');
    const cachedResult = await funcCached('param1', 'param2');

    expect(firstResult).toBe('firstResult - param1, param2');
    expect(secondResult).toBe('secondResult - param1, param2');
    expect(cachedResult).toBe('secondResult - param1, param2');
  });

  it('returns cached value wehn "time to live" has not been passed', async () => {
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

    const funcCached = withCache(func, { timeToLive: 10 });

    const firstResult = await funcCached('param1', 'param2');
    // await delay(5);
    jest.advanceTimersByTime(5);
    const cachedResult = await funcCached('param1', 'param2');

    expect(firstResult).toBe('firstResult - param1, param2');
    expect(cachedResult).toBe('firstResult - param1, param2');
  });
});
