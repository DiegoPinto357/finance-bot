import { TradingViewAPI } from 'tradingview-scraper';
const tradingView = new TradingViewAPI();

const getTicker = async ticker => await tradingView.getTicker(ticker);

export default {
  getTicker,
};
