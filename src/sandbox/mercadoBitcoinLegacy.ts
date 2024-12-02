import axios from 'axios';

const host = 'https://www.mercadobitcoin.net';

const ticker = 'IMOB02';

(async () => {
  const data = await axios.get(`${host}/api/${ticker}/ticker`);
  console.log(data);
})();
