import { RateLimiter } from 'limiter';

interface Options {
  numOfCalls: number;
  period: number;
}

const funcWithRateLimit =
  <F extends (...args: any[]) => any>(func: F, limiter: RateLimiter) =>
  async (...args: Parameters<F>) => {
    await limiter.removeTokens(1);
    return await func(...args);
  };

export const withRateLimit = <F extends (...args: any) => any>(
  func: F,
  options: Options
) => {
  const { numOfCalls, period } = options;
  const minTime = period / numOfCalls;

  const limiter = new RateLimiter({
    tokensPerInterval: 1,
    interval: minTime,
  });

  return funcWithRateLimit(func, limiter);
};
