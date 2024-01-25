import fsMock, { promises as fs } from 'fs';
import cache, { withCache } from './cache';

type MockFs = typeof fsMock & {
  mockFile: (filename: string, data: unknown) => void;
  clearMockFiles: () => void;
};

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

jest.mock('fs');

jest.mock('../config', () => ({
  cache: { defaultTimeToLive: 5 * 60 * 1000 },
}));

global.console = {
  ...global.console,
  log: jest.fn(),
  dir: jest.fn(),
  error: jest.fn(),
  table: jest.fn(),
};

describe('cache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    (fsMock as MockFs).clearMockFiles();
    cache.clear();
  });

  it('caches a function call with params', async () => {
    let iteration = 0;
    const func = async (a: string, b: string) => {
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

    cache.clear();

    const secondResult = await funcCached('param1', 'param2');

    expect(firstResult).toBe('firstResult - param1, param2');
    expect(cachedResult).toBe('firstResult - param1, param2');
    expect(secondResult).toBe('secondResult - param1, param2');
  });

  it('caches a function call with params from a provided data node', async () => {
    let iteration = 0;
    const func = async (a: string, b: string) => {
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

    const { data: firstResult } = await funcCached<{ data: string }>(
      'param1',
      'param2'
    );
    const { data: cachedResult } = await funcCached<{ data: string }>(
      'param1',
      'param2'
    );

    cache.clear();

    const { data: secondResult } = await funcCached<{ data: string }>(
      'param1',
      'param2'
    );

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
    const func = async (a: string, b: string) => {
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
    let iteration: number;
    const func = async (a: string, b: string) => {
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

      const minute = 60 * 1000;

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

    it('returns cached value when "time to live" has not been passed', async () => {
      const funcCached = withCache(func, { timeToLive: 10 });

      const firstResult = await funcCached('param1', 'param2');
      jest.advanceTimersByTime(5);
      const cachedResult = await funcCached('param1', 'param2');

      expect(firstResult).toBe('firstResult - param1, param2');
      expect(cachedResult).toBe('firstResult - param1, param2');
    });
  });

  describe('error handling', () => {
    it('does not cache data in case of error', async () => {
      let iteration = 0;
      const func = async () => {
        return new Promise(resolve => {
          if (iteration === 0) {
            iteration++;
            throw new Error('error!');
          }
          iteration++;
          resolve('result');
        });
      };

      const funcCached = withCache(func);

      await expect(funcCached()).rejects.toThrow('error!');
      await expect(funcCached()).resolves.toEqual('result');
    });

    it('returns stale cache if function returns error', async () => {
      let iteration = 0;
      const func = async () => {
        return new Promise(resolve => {
          if (iteration === 1) {
            iteration++;
            throw new Error('error!');
          }
          iteration++;
          resolve('staleResult');
        });
      };

      const funcCached = withCache(func, { timeToLive: 10 });

      await expect(funcCached()).resolves.toEqual('staleResult');
      jest.advanceTimersByTime(20);
      await expect(funcCached()).resolves.toEqual('staleResult');
    });
  });

  describe('non volatile cache', () => {
    it('does not load cache file if it does not exists', async () => {
      const func = jest.fn(async () => Promise.resolve('realResult'));
      await cache.init();

      const funcCached = withCache(func);
      const result = await funcCached();

      expect(result).toBe('realResult');
      expect(func).toBeCalled();
    });

    it('loads cache file', async () => {
      const func = jest.fn(async () => Promise.resolve('realResult'));

      (fsMock as MockFs).mockFile(
        './.cache/main.json',
        JSON.stringify({
          f6c1553c69e1ed4a172a469af57505bd26fc47c7: { data: 'cachedResult' },
        })
      );
      await cache.init();

      const funcCached = withCache(func);
      const result = await funcCached();

      expect(result).toBe('cachedResult');
      expect(func).not.toBeCalled();
    });

    it('saves cache file', async () => {
      const func = jest.fn(async () => Promise.resolve('realResult'));
      await cache.init();

      const funcCached = withCache(func);
      const result = await funcCached();
      await cache.saveData();

      expect(result).toBe('realResult');
      expect(fs.writeFile).toBeCalledTimes(1);
      expect(fs.writeFile).toBeCalledWith(
        './.cache/main.json',
        JSON.stringify(
          {
            f6c1553c69e1ed4a172a469af57505bd26fc47c7: {
              data: 'realResult',
              timestamp: 1577837160045,
            },
          },
          null,
          2
        ),
        'utf-8'
      );
    });
  });
});
