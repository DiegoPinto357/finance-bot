import 'dotenv/config';
import CoinMarketCap from 'coinmarketcap-api';

const apiKey = process.env.COIMARKETCAP_API_KEY;

(async () => {
  const symbol = 'SPHERE';
  const client = new CoinMarketCap(apiKey);
  const response = await client.getQuotes({ symbol, convert: 'BRL' });
  console.log(response.data[symbol]);
})();
