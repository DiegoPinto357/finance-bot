import 'dotenv/config';
import fetch from 'node-fetch';

const apikey = process.env.SNOWTRACE_API_KEY;
const contractaddress = '0xcdfd91eea657cc2701117fe9711c9a4f61feed23'; // AVAX-PTP pool address

const totalSupplyParams = new URLSearchParams({
  module: 'stats',
  action: 'tokensupply',
  contractaddress,
  apikey,
});

const contractPTPBalanceParams = new URLSearchParams({
  module: 'account',
  action: 'tokenbalance',
  contractaddress: '0x22d4002028f537599be9f666d1c4fa138522f9c8', // PTP token
  tag: 'latest',
  address: contractaddress,
  apikey,
});

const contractAVAXBalanceParams = new URLSearchParams({
  module: 'account',
  action: 'tokenbalance',
  contractaddress: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7', // AVAX token
  tag: 'latest',
  address: contractaddress,
  apikey,
});

const totalSupplyUrl = `https://api.snowtrace.io/api?${totalSupplyParams}`;
const contractPTPBalanceUrl = `https://api.snowtrace.io/api?${contractPTPBalanceParams}`;
const contractAVAXBalanceUrl = `https://api.snowtrace.io/api?${contractAVAXBalanceParams}`;

(async () => {
  const totalSupplyResponse = await fetch(totalSupplyUrl);
  const { result: totalSupply } = await totalSupplyResponse.json();

  const contractPTPBalanceResponse = await fetch(contractPTPBalanceUrl);
  const { result: contractPTPBalance } =
    await contractPTPBalanceResponse.json();

  const contractAVAXBalanceResponse = await fetch(contractAVAXBalanceUrl);
  const { result: contractAVAXBalance } =
    await contractAVAXBalanceResponse.json();

  const contractBalance = (contractPTPBalance + contractAVAXBalance) * 1e-18;

  console.log({
    totalSupply: totalSupply * 1e-18,
    contractBalance,
    contractAVAXBalance: contractAVAXBalance * 1e-18,
    contractPTPBalance: contractPTPBalance * 1e-18,
  });
})();
