import { buildLogger } from '../libs/logger';
import httpClient from '../libs/httpClient';
import { withCache } from '../libs/cache';
import delay from '../libs/delay';
import config from '../config';
import { CryptoNetwork } from '../modules/crypto/types';

type ApiKeyMapper = {
  [key in CryptoNetwork]: string;
};

const apiKeyMapper: ApiKeyMapper = {
  avalanche: 'SNOWTRACE_API_KEY',
  bsc: 'BSCSCAN_API_KEY',
  polygon: 'POLYGONSCAN_API_KEY',
};

type HttpParams = Record<string, any>;

const log = buildLogger('Blockchain');

const getCached = withCache(params => httpClient.get(params), {
  dataNode: 'result',
});

const getApiKey = (network: CryptoNetwork) =>
  process.env[apiKeyMapper[network]];

// TODO optimize params
const buildUrl = (network: CryptoNetwork, params: HttpParams) => {
  const { host } = config.crypto.networks[network];
  return `${host}/api?${params}`;
};

interface GetTokenBalance {
  asset: string;
  network: CryptoNetwork;
  wallet: string;
}

const getTokenBalance = async ({ asset, network, wallet }: GetTokenBalance) => {
  log(`Loading ${asset} token balance on ${network} network`);
  // TODO build a better rate limit system
  const min = 500;
  const max = 2500;
  const diff = max - min;
  const ms = Math.floor(Math.random() * diff) + min;
  await delay(ms);

  const { contract, native } = config.crypto.tokens[network][asset];
  const action = native ? 'balance' : 'tokenbalance';

  const params = new URLSearchParams({
    module: 'account',
    action,
    contractaddress: contract,
    address: wallet || process.env.CRYPTO_WALLET_ADDRESS,
    tag: 'latest',
    apikey: getApiKey(network),
  } as HttpParams);

  const url = buildUrl(network, params);
  const { status, result } = await getCached(url);

  if (status === '0') {
    log(`Failed to load ${asset} balance on ${network} network: ${result}`, {
      severity: 'error',
    });
    throw new Error(
      `Failed to load ${asset} balance on ${network} network: ${result}`
    );
  }

  const tokenScale = 1e-18;
  return result * tokenScale;
};

interface GetContractTokenTotalSupply {
  network: CryptoNetwork;
  contractAddress: string;
}

const getContractTokenTotalSupply = async ({
  network,
  contractAddress,
}: GetContractTokenTotalSupply) => {
  const totalSupplyParams = new URLSearchParams({
    module: 'stats',
    action: 'tokensupply',
    contractaddress: contractAddress,
    apikey: getApiKey(network),
  } as HttpParams);

  log(
    `Loading total supply of contract ${contractAddress} on ${network} network`
  );
  const { status, result } = await getCached(
    buildUrl(network, totalSupplyParams)
  );

  if (status === '0') {
    throw new Error(
      `Failed to load total supply of contract ${contractAddress} on ${network} network: ${result}`
    );
  }

  return result * 1e-18;
};

export default {
  getTokenBalance,
  getContractTokenTotalSupply,
};
