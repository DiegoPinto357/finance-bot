import currency from './currency';
import httpClient from '../libs/httpClient';
import { withCache } from '../libs/cache';
import { buildLogger } from '../libs/logger';
import config from '../config';

import type { CryptoNetwork } from '../modules/crypto/types';

const host = 'https://api.dexscreener.com';

const log = buildLogger('DexScreener');

type PairData = {
  baseToken: {
    address: string;
  };
  volume: {
    h24: number;
  };
  priceUsd: number;
};

const fetchSymbolPrice = async (symbol: string, network: CryptoNetwork) => {
  const { contract } = config.crypto.tokens[network][symbol];
  const url = `${host}/latest/dex/tokens/${contract}`;
  const { pairs } = await httpClient.get<{ pairs: PairData[] }>(url);

  if (!pairs) {
    log(`No trading pairs found for ${symbol} on ${network} network`, {
      severity: 'error',
    });
    return 0;
  }

  const result = pairs
    .sort((a, b) => b.volume.h24 - a.volume.h24)
    .find(
      ({ baseToken }) =>
        baseToken.address.toLowerCase() === contract.toLowerCase()
    );

  if (!result) {
    log(`No trading pairs found for ${symbol} on ${network} network`, {
      severity: 'error',
    });
    return 0;
  }

  const usdToBrl = await currency.getQuote('USD');
  return result.priceUsd * usdToBrl;
};

const fetchSymbolPriceCached = withCache(fetchSymbolPrice);

const getSymbolPrice = async (symbol: string, network: CryptoNetwork) => {
  log(`Loading ${symbol} token price`);
  return await fetchSymbolPriceCached(symbol, network);
};

export default {
  getSymbolPrice,
};
