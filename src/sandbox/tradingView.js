import tradingView from '../providers/tradingView.js';

const ticker = 'ALZR11';

(async () => {
  console.log(await tradingView.getTickerValue(ticker));
})();
