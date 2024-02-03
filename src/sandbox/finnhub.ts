import 'dotenv/config';
import httpClient from '../libs/httpClient';

const apiKey = process.env.FINNHUB_TOKEN;

const headers = {
  'X-Finnhub-Token': apiKey,
};

(async () => {
  const url = 'https://finnhub.io/api/v1/quote?symbol=ROMI3.SA';
  const response = await httpClient.get(url, { headers });
  console.log(response);
})();
