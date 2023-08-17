import tickers from '../../../mockData/mercadoBitcoin/tickers.json';

interface Ticker {
  ticker: {
    high: string;
    low: string;
    vol: string;
    last: string;
    buy: string;
    sell: string;
    open: string;
    date: number;
  };
}

const getTicker = (ticker: string) =>
  Promise.resolve((tickers as Record<string, Ticker>)[ticker].ticker);

module.exports = {
  getTicker,
};
