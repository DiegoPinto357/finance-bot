import googleSheets from '../../../../providers/GoogleSheets';
import coinMarketCap from '../../../../providers/coinMarketCap';
import blockchain from '../../../../providers/blockchain';

const wallets = {
  defi: process.env.CRYPTO_WALLET_ADDRESS,
  defi2: process.env.CRYPTO_SECONDARY_WALLET_ADDRESS,
};

const getBalance = async assetName => {
  const balance = await googleSheets.loadSheet(`crypto-${assetName}-float`);
  return await Promise.all(
    balance.map(async ({ asset, network }) => {
      const priceBRL = await coinMarketCap.getSymbolPrice(asset, network);

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
        depositBRL: 0,
        depositAmount: 0,
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
