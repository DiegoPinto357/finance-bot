const tradingView = require('./tradingView');
const httpClient = require('../libs/httpClient');
const { withCache } = require('../libs/cache');
const { buildLogger } = require('../libs/logger');
const config = require('../config');

const host = 'https://api.dexscreener.com';

const log = buildLogger('DexScreener');

const fetchSymbolPrice = async (symbol, network) => {
  const { contract } = config.crypto.tokens[network][symbol];
  const url = `${host}/latest/dex/tokens/${contract}`;
  const { pairs } = await httpClient.get(url);

  if (!pairs) {
    throw new Error(
      `No trading pairs found for ${symbol} on ${network} network`
    );
  }

  const result = pairs
    .sort((a, b) => b.volume.h24 - a.volume.h24)
    .find(
      ({ baseToken }) =>
        baseToken.address.toLowerCase() === contract.toLowerCase()
    );

  const { lp: usdToBrl } = await tradingView.getTicker('USDBRL');
  return result.priceUsd * usdToBrl;
};

const fetchSymbolPriceCached = withCache((...params) =>
  fetchSymbolPrice(...params)
);

const getSymbolPrice = async (symbol, network) => {
  log(`Loading ${symbol} token price`);
  return await fetchSymbolPriceCached(symbol, network);
};

module.exports = {
  getSymbolPrice,
};
