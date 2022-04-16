import 'dotenv/config';
import fetch from 'node-fetch';

const bscscanApiKey = process.env.BSCSCAN_API_KEY;
const polygonApiKey = process.env.POLYGONSCAN_API_KEY;
const walletAddress = process.env.CRYPTO_WALLET_ADDRESS;
const titanoContract = '0xBA96731324dE188ebC1eD87ca74544dDEbC07D7f';
const sphereContract = '0x8d546026012bf75073d8a586f24a5d5ff75b9716';

// const url = `https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=${titanoContract}&address=${walletAddress}&tag=latest&apikey=${bscscanApiKey}`;

const url = `https://api.polygonscan.com/api?module=account&action=tokenbalance&contractaddress=${sphereContract}&address=${walletAddress}&tag=latest&apikey=${polygonApiKey}`;

(async () => {
  const response = await fetch(url);
  const { result } = await response.json();
  const tokenScale = 1e-18;
  const amount = result * tokenScale;
  console.log(amount);
})();
