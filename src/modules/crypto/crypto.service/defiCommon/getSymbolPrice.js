import coinMarketCap from '../../../../providers/coinMarketCap';
import dexScreener from '../../../../providers/dexScreener';
import { buildLogger } from '../../../../libs/logger';

const log = buildLogger('CoinMarketCap');

export default async (asset, network) => {
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
