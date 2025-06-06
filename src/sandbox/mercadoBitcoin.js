// npx ts-node src/sandbox/mercadoBitcoin.js
import 'dotenv/config';
import axios from 'axios';

const host = 'https://api.mercadobitcoin.net/api/v4';
const login = process.env.MERCADO_BITCOIN_API_KEY;
const password = process.env.MERCADO_BITCOIN_API_SECRET;

const getAccountBanlance = async () => {
  const authRes = await axios.post(`${host}/authorize`, { login, password });
  const { access_token, expiration } = authRes.data;
  console.log({ access_token, expiration, now: Date.now() });

  const headers = { Authorization: `Bearer ${access_token}` };

  const accountRes = await axios.get(`${host}/accounts`, {
    headers,
  });
  const { id: accountId } = accountRes.data[0];
  // console.log(accountRes.data);
  console.log({ accountId });

  const balancesRes = await axios.get(
    `${host}/accounts/${accountId}/balances`,
    {
      headers,
    }
  );
  const balances = balancesRes.data.filter(balance => balance.total > 0);
  console.log({ balances });

  const symbols = balances
    .map(({ symbol }) => symbol)
    .reduce(
      (symbols, ticker) =>
        symbols === '' ? `${ticker}-BRL` : `${symbols},${ticker}-BRL`,
      ''
    );
  console.log({ symbols });

  const tickers = await axios.get(`${host}/tickers?symbols=${symbols}`, {
    headers,
  });
  console.log(tickers.data);
};

(async () => {
  const date = new Date();
  const timestamp = date.getTime();
  const { data } = await axios.get(
    `${host}/candles?symbol=IMOB02-BRL&resolution=1m&to=${timestamp}&countback=1`
  );
  console.log(data);
})();
