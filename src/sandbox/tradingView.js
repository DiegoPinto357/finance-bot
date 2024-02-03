import tradingView from '../providers/tradingView.js';

const ticker = 'TWKS';

(async () => {
  console.log(await tradingView.getTicker(ticker));
})();
