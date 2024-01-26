import coinMarketCap from '../../../../providers/coinMarketCap';
import dexScreener from '../../../../providers/dexScreener';
import { buildLogger } from '../../../../libs/logger';

import type { CryptoNetwork } from '../../types';

const log = buildLogger('CoinMarketCap');

export default async (asset: string, network: CryptoNetwork) => {
  try {
    return await coinMarketCap.getSymbolPrice(asset, network);
  } catch (error) {
    let errorMessage;
    if (error instanceof Error) errorMessage = error.message;
    else errorMessage = String(error);

    log(
      `Failed to load ${asset} price on ${network} network: ${errorMessage}`,
      {
        severity: 'warn',
      }
    );
    return await dexScreener.getSymbolPrice(asset, network);
  }
};
