import googleSheets from '../../../../providers/GoogleSheets';
import blockchain from '../../../../providers/blockchain';
import getSymbolPrice from './getSymbolPrice';

const wallets = {
  defi: process.env.CRYPTO_WALLET_ADDRESS,
  defi2: process.env.CRYPTO_SECONDARY_WALLET_ADDRESS,
};

const getBalance = async assetName => {
  const balance = await googleSheets.loadSheet(`crypto-${assetName}-float`);
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
