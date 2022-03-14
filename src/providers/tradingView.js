import { TradingViewAPI } from 'tradingview-scraper';
const tradingView = new TradingViewAPI();

const getTickerValue = async ticker => {
  const response = await tradingView.getTicker(ticker);
  return response.lp;
};

export default {
  getTickerValue,
};
