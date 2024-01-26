import database from '../../../../providers/database';
import blockchain from '../../../../providers/blockchain';
import getSymbolPrice from './getSymbolPrice';

import type { CryptoNetwork } from '../../types';

type Token = {
  asset: string;
  description: string;
  deposits: { BRL: number; token: number };
  token: { network: CryptoNetwork };
  fees: { sell: number };
};

type Wallet = 'walletPrimary' | 'walletSecondary';

type WalletAddress = Record<Wallet, string>;

const walletAddresss: WalletAddress = {
  walletPrimary: process.env.CRYPTO_WALLET_ADDRESS!,
  walletSecondary: process.env.CRYPTO_SECONDARY_WALLET_ADDRESS!,
};

const getTokenBalanceFromBlockchain = async (
  wallet: Wallet,
  asset: string,
  network: CryptoNetwork,
  sellFee: number
) => {
  const [currentAmount, priceBRL] = await Promise.all([
    blockchain.getTokenBalance({
      wallet: walletAddresss[wallet],
      asset,
      network,
    }),
    getSymbolPrice(asset, network),
  ]);

  const positionBRL = currentAmount * priceBRL * (1 - sellFee);

  return {
    currentAmount,
    priceBRL,
    positionBRL,
  };
};

const getBalance = async (wallet: Wallet) => {
  const tokens = await database.find<Token[]>(
    'assets',
    'crypto',
    { location: wallet, type: 'autostaking' },
    { projection: { _id: 0 } }
  );
  const balance = await Promise.all(
    tokens.map(({ asset, token, fees }) =>
      getTokenBalanceFromBlockchain(wallet, asset, token.network, fees.sell)
    )
  );

  return tokens.map((token, index) => {
    const { asset, description, deposits, fees } = token;
    const { BRL: depositBRL, token: depositAmount } = deposits;
    const { sell: sellFee } = fees;
    const { currentAmount, priceBRL, positionBRL } = balance[index];
    return {
      type: 'autostaking',
      asset,
      description,
      depositBRL,
      depositAmount,
      currentAmount,
      sellFee,
      performanceFee: undefined,
      endDate: undefined,
      priceBRL,
      positionBRL,
    };
  });
};

export default {
  getBalance,
};
