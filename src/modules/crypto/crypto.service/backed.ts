import mercadoBitcoin from '../../../providers/mercadoBitcoin';
import mercadoBitcoinLegacy from '../../../providers/mercadoBitcoinLegacy';
import { buildLogger } from '../../../libs/logger';

const log = buildLogger('Crypto - Backed');

const getBalance = async () => {
  const assets = await mercadoBitcoin.getAccountBalance();
  const tickers = await mercadoBitcoin.getTickers(
    assets.map(({ symbol }) => symbol).filter(symbol => symbol !== 'BRL')
  );
  const tickersMap = new Map(tickers.map(ticker => [ticker.pair, ticker]));

  const balance = await Promise.all(
    assets.map(async ({ symbol, total }) => {
      const position = parseFloat(total);
      if (symbol === 'BRL') {
        return {
          asset: symbol,
          position,
          priceBRL: 1,
          positionBRL: position,
        };
      }

      let tickerData = tickersMap.get(`${symbol}-BRL`);
      // FIXME re-validate mercado bitcoin api v4
      if (!tickerData) {
        log(`${symbol} data not available`, { severity: 'warn' });
        tickerData = await mercadoBitcoinLegacy.getTicker(symbol);
      }
      const { last } = tickerData!;
      const priceBRL = parseFloat(last);
      const positionBRL = position * priceBRL;
      return {
        asset: symbol,
        position,
        priceBRL,
        positionBRL,
      };
    })
  );

  const total = balance.reduce((sum, { positionBRL }) => sum + positionBRL, 0);

  return { balance, total };
};

const getTotalPosition = async (asset?: string) => {
  const { balance, total } = await getBalance();

  if (!asset) {
    return total;
  }

  const assetBalance = balance.find(item => item.asset === asset);
  return assetBalance ? assetBalance.positionBRL : 0;
};

export default {
  getBalance,
  getTotalPosition,
  getHistory: () => {
    throw new Error('Not implemented');
  },
  deposit: (..._params: any) => {
    throw new Error('Not implemented');
  },
  sell: (..._params: any) => {
    throw new Error('Not implemented');
  },
};
