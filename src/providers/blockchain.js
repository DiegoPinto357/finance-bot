import 'dotenv/config';
import fetch from 'node-fetch';
import { buildLogger } from '../libs/logger';
import delay from '../libs/delay';
import config from '../config';

// TODO move to a util lib

const log = buildLogger('Blockchain');

const apiKeyMapper = {
  avalanche: 'SNOWTRACE_API_KEY',
  bsc: 'BSCSCAN_API_KEY',
  polygon: 'POLYGONSCAN_API_KEY',
};

const getApiKey = network => process.env[apiKeyMapper[network]];

const buildUrl = (network, { params }) => {
  const { host } = config.crypto.networks[network];
  return `${host}/api?${params}`;
};

const getTokenBalance = async ({ asset, network, wallet }) => {
  // TODO build a better rate limit system
  await delay(500);

  const { contract, native } = config.crypto.tokens[network][asset];
  const action = native ? 'balance' : 'tokenbalance';

  const params = new URLSearchParams({
    module: 'account',
    action,
    contractaddress: contract,
    address: wallet || process.env.CRYPTO_WALLET_ADDRESS,
    tag: 'latest',
    apikey: getApiKey(network),
  });

  const url = buildUrl(network, { params });

  log(`Loading ${asset} token balance on ${network} network`);
  const response = await fetch(url);
  const { status, result } = await response.json();

  if (status === '0') {
    log(`Failed to load ${asset} balance on ${network} network: ${result}`);
  }

  const tokenScale = 1e-18;
  return result * tokenScale;
};

const getContractTokenTotalSupply = async ({ network, contractAddress }) => {
  const totalSupplyParams = new URLSearchParams({
    module: 'stats',
    action: 'tokensupply',
    contractaddress: contractAddress,
    apikey: getApiKey(network),
  });

  log(
    `Loading total supply of contract ${contractAddress} on ${network} network`
  );
  const response = await fetch(
    buildUrl(network, { params: totalSupplyParams })
  );
  const { result } = await response.json();

  return result * 1e-18;
};

export default {
  getTokenBalance,
  getContractTokenTotalSupply,
};
