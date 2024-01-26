import googleSheets from '../../../../providers/googleSheets';
import blockchain from '../../../../providers/blockchain';
import getSymbolPrice from './getSymbolPrice';

import type { CryptoNetwork } from '../../types';

type BalanceItem = {
  asset: string;
  depositBRL: string;
  depositAmount: string;
  network: CryptoNetwork;
};

type AssetName = 'defi' | 'defi2';

type WalletAddress = Record<AssetName, string>;

const wallets: WalletAddress = {
  defi: process.env.CRYPTO_WALLET_ADDRESS!,
  defi2: process.env.CRYPTO_SECONDARY_WALLET_ADDRESS!,
};

const getBalance = async (assetName: AssetName) => {
  const balance = await googleSheets.loadSheet<BalanceItem[]>(
    `crypto-${assetName}-float`
  );
  return await Promise.all(
    balance.map(async ({ asset, depositBRL, depositAmount, network }) => {
      const priceBRL = await getSymbolPrice(asset, network);

      const currentAmount = await blockchain.getTokenBalance({
        wallet: wallets[assetName],
        asset,
        network,
      });
      const positionBRL = currentAmount * priceBRL;

      return {
        type: 'float',
        asset,
        description: `${asset} token`,
        depositBRL,
        depositAmount,
        currentAmount,
        sellFee: undefined,
        performanceFee: undefined,
        endDate: undefined,
        priceBRL,
        positionBRL,
      };
    })
  );
};

export default {
  getBalance,
};
