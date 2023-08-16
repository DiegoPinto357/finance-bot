import { withRateLimit } from './rateLimiter';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('rate limiter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('limits the call rate to a function', async () => {
    const period = 5;

    const func = jest.fn((arg: string) => Promise.resolve(arg));
    const funcWithRateLimit = jest.fn(
      withRateLimit(func, {
        numOfCalls: 1,
        period,
      })
    );

    const numOfCalls = 10;

    const resultPromises = new Array(numOfCalls)
      .fill(null)
      .map((_item, index) => funcWithRateLimit(`banana ${index}`));

    expect(funcWithRateLimit).toBeCalledTimes(numOfCalls);
    expect(func).not.toBeCalled();

    await delay(numOfCalls * period + 1);

    expect(func).toBeCalledTimes(numOfCalls);

    const results = await Promise.all(resultPromises);
    const expectedResults = new Array(numOfCalls)
      .fill(null)
      .map((_item, index) => `banana ${index}`);

    expect(results).toEqual(expectedResults);
  });
});
