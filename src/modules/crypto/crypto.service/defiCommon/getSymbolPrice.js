import coinMarketCap from '../../../../providers/coinMarketCap';
import dexScreener from '../../../../providers/dexScreener';

export default async (asset, network) => {
  try {
    return await coinMarketCap.getSymbolPrice(asset, network);
  } catch (e) {
    return await dexScreener.getSymbolPrice(asset, network);
  }
};
