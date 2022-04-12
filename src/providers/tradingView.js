import { TradingViewAPI } from 'tradingview-scraper';
import { buildLogger } from '../libs/logger';

const tradingView = new TradingViewAPI();

const log = buildLogger('TradingView');

const getTicker = async ticker => {
  log(`Loading ticker ${ticker}`);
  return await tradingView.getTicker(ticker);
};

export default {
  getTicker,
};
