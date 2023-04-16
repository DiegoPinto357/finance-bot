const coinMarketCap = require('../../../../providers/coinMarketCap');
const dexScreener = require('../../../../providers/dexScreener');
const { buildLogger } = require('../../../../libs/logger');

const log = buildLogger('CoinMarketCap');

module.exports = async (asset, network) => {
  try {
    return await coinMarketCap.getSymbolPrice(asset, network);
  } catch (error) {
    log(
      `Failed to load ${asset} price on ${network} network: ${error.message}`,
      {
        severity: 'warn',
      }
    );
    return await dexScreener.getSymbolPrice(asset, network);
  }
};
