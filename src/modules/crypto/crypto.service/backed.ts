import mercadoBitcoin from '../../../providers/mercadoBitcoin';
import mercadoBitcoinLegacy from '../../../providers/mercadoBitcoinLegacy';
import { buildLogger } from '../../../libs/logger';

import type { Ticker } from '../../../providers/mercadoBitcoin';

const log = buildLogger('Crypto - Backed');

const valueOverrides = [{ ticker: 'IMOB02', value: 137.66 }];

const getPriceBRL = async (ticker: string, tickerData: Ticker) => {
  const valueOverride = valueOverrides.find(
    override => override.ticker === ticker
  );
  if (valueOverride) {
    log(`Overriding value for ${ticker}`, {
      severity: 'warn',
    });
    return valueOverride?.value;
  }

  const { last, sell, buy } = tickerData;

  const lastPriceBRL = parseFloat(last);
  if (lastPriceBRL > 0) return lastPriceBRL;

  log(`Last price not available for ${tickerData.pair}`, {
    severity: 'warn',
  });

  const { l } = await mercadoBitcoin.getCandles(ticker);
  const lastPriceCandleBRL = parseFloat(l[0]);
  if (lastPriceCandleBRL > 0) return parseFloat(l[0]);

  const sellPriceBRL = parseFloat(sell);
  if (sellPriceBRL > 0) return sellPriceBRL;

  const buyPriceBRL = parseFloat(buy);
  if (buyPriceBRL > 0) return buyPriceBRL;

  log(`Sell/buy price not available for ${tickerData.pair}`, {
    severity: 'error',
  });

  return 0;
};

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
      if (!tickerData) {
        log(`${symbol} data not available`, { severity: 'warn' });
        tickerData = await mercadoBitcoinLegacy.getTicker(symbol);
      }

      const priceBRL = await getPriceBRL(symbol, tickerData);

      return {
        asset: symbol,
        position,
        priceBRL,
        positionBRL: position * priceBRL,
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
  deposit: (..._params: any) => {
    throw new Error('Not implemented');
  },
  sell: (..._params: any) => {
    throw new Error('Not implemented');
  },
};
