import 'dotenv/config';
import fetch from 'node-fetch';
import { buildLogger } from '../libs/logger';
import config from '../config';

const log = buildLogger('BlockchainScan');

const getApiKey = network => {
  const envKey = `${network.toUpperCase()}SCAN_API_KEY`;
  return process.env[envKey];
};

const buildUrl = (network, { params }) => {
  const { host } = config.crypto.networks[network];
  return `${host}/api?${params}`;
};

const getTokenBalance = async ({ asset, network, contract }) => {
  const params = new URLSearchParams({
    module: 'account',
    action: 'tokenbalance',
    contractaddress: contract,
    address: process.env.CRYPTO_WALLET_ADDRESS,
    tag: 'latest',
    apikey: getApiKey(network),
  });

  const url = buildUrl(network, { params });

  log(`Loading ${asset} token balance on ${network} network`);
  const response = await fetch(url);
  const { result } = await response.json();
  const tokenScale = 1e-18;
  return result * tokenScale;
};

export default {
  getTokenBalance,
};
