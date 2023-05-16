import database from '../../../../providers/database';
import blockchain from '../../../../providers/blockchain';
import getSymbolPrice from './getSymbolPrice';

const wallets = {
  walletPrimary: process.env.CRYPTO_WALLET_ADDRESS,
  walletSecondary: process.env.CRYPTO_SECONDARY_WALLET_ADDRESS,
};

const getTokenBalanceFromBlockchain = async (
  wallet,
  asset,
  network,
  sellFee
) => {
  const [currentAmount, priceBRL] = await Promise.all([
    blockchain.getTokenBalance({ wallet: wallets[wallet], asset, network }),
    getSymbolPrice(asset, network),
  ]);

  const positionBRL = currentAmount * priceBRL * (1 - sellFee);

  return {
    currentAmount,
    priceBRL,
    positionBRL,
  };
};

const getBalance = async wallet => {
  const tokens = await database.find(
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
