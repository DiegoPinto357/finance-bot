import tickers from '../../../mockData/mercadoBitcoin/tickers.json';

const getTicker = ticker => Promise.resolve(tickers[ticker]?.ticker);

export default {
  getTicker,
};
