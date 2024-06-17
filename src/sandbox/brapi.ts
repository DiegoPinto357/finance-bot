import httpClient from '../libs/httpClient';

const accessToken = '';
const headers = { Authorization: `Bearer ${accessToken}` };

(async () => {
  const urlQ = `https://brapi.dev/api/quote/MXRF11`;
  const responseQ = await httpClient.get(urlQ, { headers });
  console.log(responseQ);

  // const urlC = `https://brapi.dev/api/v2/currency?currency=USD-BRL`;
  // const responseC = await httpClient.get(urlC, { headers });
  // console.log(responseC);
})();
