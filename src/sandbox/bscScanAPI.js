import 'dotenv/config';
import fetch from 'node-fetch';

const titanoContract = '0xBA96731324dE188ebC1eD87ca74544dDEbC07D7f';
const sphereContract = '0x8d546026012bf75073d8a586f24a5d5ff75b9716';

const network = 'bsc';
const contract = titanoContract;
const apikey = process.env[`${network.toUpperCase()}SCAN_API_KEY`];

const tokenbalanceParams = new URLSearchParams({
  module: 'account',
  action: 'tokenbalance',
  contractaddress: contract,
  address: process.env.CRYPTO_WALLET_ADDRESS,
  tag: 'latest',
  apikey,
});

const txlistParams = new URLSearchParams({
  module: 'account',
  action: 'txlist',
  address: process.env.CRYPTO_WALLET_ADDRESS,
  startblock: 0,
  endblock: 99999999,
  page: 1,
  offset: 100,
  sort: 'desc',
  apikey,
});

const params = txlistParams;

const url = `https://api.${network}scan.com/api?${params}`;

// const url = `https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=${titanoContract}&address=${walletAddress}&tag=latest&apikey=${bscscanApiKey}`;

// const url = `https://api.polygonscan.com/api?module=account&action=tokenbalance&contractaddress=${sphereContract}&address=${walletAddress}&tag=latest&apikey=${polygonApiKey}`;

(async () => {
  const response = await fetch(url);
  console.log(await response.json());
  // const { result } = await response.json();
  // const tokenScale = 1e-18;
  // const amount = result * tokenScale;
  // console.log(amount);
})();
