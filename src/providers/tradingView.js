const { TradingViewAPI } = require('tradingview-scraper');
// const pRetry = require('p-retry');
const { withCache } = require('../libs/cache');
const { buildLogger } = require('../libs/logger');

const getTickerCached = withCache(params => tradingView.getTicker(params));

const tradingView = new TradingViewAPI();

const log = buildLogger('TradingView');

const getTickerRetry = async ticker => {
  try {
    return await getTickerCached(ticker);
  } catch (error) {
    throw new Error(error);
  }
};

const onFailedAttempt = ticker => error =>
  log(
    `Loading ticker ${ticker}: Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`,
    { severity: 'warn' }
  );

const getTicker = async ticker => {
  log(`Loading ticker ${ticker}`);
  try {
    // return await pRetry(() => getTickerRetry(ticker), {
    //   retries: 5,
    //   onFailedAttempt: onFailedAttempt(ticker),
    // });
    return await getTickerRetry(ticker);
  } catch (error) {
    log(`Error loading ticker ${ticker}`, { severity: 'error' });
    throw error;
  }
};

module.exports = {
  getTicker,
};
