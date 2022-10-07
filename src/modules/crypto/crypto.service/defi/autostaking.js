import database from '../../../../providers/database';
import blockchain from '../../../../providers/blockchain';
import coinMarketCap from '../../../../providers/coinMarketCap';

const getTokenBalanceFromBlockchain = async (asset, network, sellFee) => {
  const [currentAmount, priceBRL] = await Promise.all([
    blockchain.getTokenBalance({ asset, network }),
    coinMarketCap.getSymbolPrice(asset, network),
  ]);

  const positionBRL = currentAmount * priceBRL * (1 - sellFee);

  return {
    currentAmount,
    priceBRL,
    positionBRL,
  };
};

const getBalance = async () => {
  const tokens = await database.find(
    'assets',
    'crypto',
    { location: 'walletPrimary', type: 'autostaking' },
    { projection: { _id: 0 } }
  );
  const balance = await Promise.all(
    tokens.map(({ asset, token, fees }) =>
      getTokenBalanceFromBlockchain(asset, token.network, fees.sell)
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
