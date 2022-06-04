import { TradingViewAPI } from 'tradingview-scraper';
import { withCache } from '../libs/cache';
import { buildLogger } from '../libs/logger';

const getTickerCached = withCache(params => tradingView.getTicker(params));

const tradingView = new TradingViewAPI();

const log = buildLogger('TradingView');

const getTicker = async ticker => {
  log(`Loading ticker ${ticker}`);
  return await getTickerCached(ticker);
};

export default {
  getTicker,
};
