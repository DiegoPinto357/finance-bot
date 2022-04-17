import 'dotenv/config';
import CoinMarketCap from 'coinmarketcap-api';
import { buildLogger } from '../libs/logger';

const client = new CoinMarketCap(process.env.COIMARKETCAP_API_KEY);

const log = buildLogger('CoinMarketCap');

const getSymbolPrice = async symbol => {
  log(`Loading ${symbol} token price`);
  const response = await client.getQuotes({ symbol, convert: 'BRL' });
  return response.data[symbol].quote.BRL.price;
};

export default {
  getSymbolPrice,
};
