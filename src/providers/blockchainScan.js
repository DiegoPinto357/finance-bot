import 'dotenv/config';
import fetch from 'node-fetch';
import config from '../config';
import { buildLogger } from '../libs/logger';

const log = buildLogger('BlockchainScan');

const getTokenContractAddress = token => config.crypto.tokens[token];

const getApiKey = network => {
  const envKey = `${network.toUpperCase()}SCAN_API_KEY`;
  return process.env[envKey];
};

const buildUrl = (network, { params }) =>
  `https://api.${network}scan.com/api?${params}`;

const getTokenBalance = async ({ network, token }) => {
  const params = new URLSearchParams({
    module: 'account',
    action: 'tokenbalance',
    contractaddress: getTokenContractAddress(token),
    address: process.env.CRYPTO_WALLET_ADDRESS,
    tag: 'latest',
    apikey: getApiKey(network),
  });

  const url = buildUrl(network, { params });

  log(`Loading ${token} token balance on ${network} network`);
  const response = await fetch(url);
  const { result } = await response.json();
  const tokenScale = 1e-18;
  return result * tokenScale;
};

export default {
  getTokenBalance,
};
