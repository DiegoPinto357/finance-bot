const tickers = require('../../../mockData/mercadoBitcoin/tickers.json');

const getTicker = ticker => Promise.resolve(tickers[ticker].ticker);

module.exports = {
  getTicker,
};
