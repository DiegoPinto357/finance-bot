import 'dotenv/config';
import fetch from 'node-fetch';
import { buildLogger } from '../libs/logger';
import config from '../config';

const log = buildLogger('Blockchain');

// FIXME not working
// const apiKeyMapper = [
//   { network: 'bsc', varName: 'BSCSCAN_API_KEY' },
//   { network: 'polygon', varName: 'POLYGONSCAN_API_KEY' },
//   { network: 'avalanche', varname: 'SNOWTRACE_API_KEY' },
// ];

const buildUrl = (network, { params }) => {
  const { host } = config.crypto.networks[network];
  return `${host}/api?${params}`;
};

const getTokenBalance = async ({ asset, network, wallet }) => {
  const params = new URLSearchParams({
    module: 'account',
    action: 'tokenbalance',
    contractaddress: config.crypto.tokens[network][asset].contract,
    address: wallet || process.env.CRYPTO_WALLET_ADDRESS,
    tag: 'latest',
    // apikey: apiKeyMapper[network],
  });

  const url = buildUrl(network, { params });

  log(`Loading ${asset} token balance on ${network} network`);
  const response = await fetch(url);
  const { result } = await response.json();
  const tokenScale = 1e-18;
  return result * tokenScale;
};

const getContractTokenTotalSupply = async ({ network, contractAddress }) => {
  const totalSupplyParams = new URLSearchParams({
    module: 'stats',
    action: 'tokensupply',
    contractaddress: contractAddress,
    // apikey: apiKeyMapper[network],
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
