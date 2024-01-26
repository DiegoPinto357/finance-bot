import googleSheets from '../../../../providers/googleSheets';
import getSymbolPrice from './getSymbolPrice';

import type { CryptoNetwork } from '../../types';

type AssetName = 'defi' | 'defi2';

type BalanceItem = {
  asset: string;
  description: string;
  network: CryptoNetwork;
  depositBRL: number;
  depositAmount: number;
  currentAmount: number;
  sellFee: number;
  endDate: string;
};

const getBalance = async (assetName: AssetName) => {
  const balance = await googleSheets.loadSheet<BalanceItem[]>(
    `crypto-${assetName}-staking`
  );

  const prices = await Promise.all(
    balance.map(({ asset, network }) => getSymbolPrice(asset, network))
  );

  return balance.map((item, index) => {
    const {
      asset,
      description,
      depositBRL,
      depositAmount,
      currentAmount,
      sellFee,
      endDate,
    } = item;
    return {
      type: 'staking',
      asset,
      description,
      depositBRL,
      depositAmount,
      currentAmount,
      sellFee,
      performanceFee: undefined,
      endDate,
      priceBRL: prices[index],
      positionBRL: item.currentAmount * prices[index] * (1 - item.sellFee),
    };
  });
};

export default {
  getBalance,
};
