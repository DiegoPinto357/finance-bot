import { buildLogger } from '../libs/logger';
import httpClient from '../libs/httpClient';
import { withCache } from '../libs/cache';
import { withRateLimit } from '../libs/rateLimiter';
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

const tokenScale = 1e-18;

const getWithRateLimit = withRateLimit(params => httpClient.get(params), {
  numOfCalls: 5,
  period: 1000,
});

const getCached = withCache(params => getWithRateLimit(params), {
  dataNode: 'result',
});

const getApiKey = (network: CryptoNetwork) =>
  process.env[apiKeyMapper[network]];

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

  return result * tokenScale;
};

export default {
  getTokenBalance,
  getContractTokenTotalSupply,
};
