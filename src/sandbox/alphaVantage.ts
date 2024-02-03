import 'dotenv/config';
import httpClient from '../libs/httpClient';

const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

(async () => {
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=HGLG11.SA&apikey=${apiKey}`;
  const response = await httpClient.get(url);
  console.log(response);
})();

// (async () => {
//   const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=BLR&apikey=${apiKey}`;
//   const response = await httpClient.get(url);
//   console.log(response);
// })();
