import googleSheets from '../../../../providers/GoogleSheets';
import coinMarketCap from '../../../../providers/coinMarketCap';
import blockchain from '../../../../providers/blockchain';

const getBalance = async () => {
  const balance = await googleSheets.loadSheet('crypto-defi-float');
  return await Promise.all(
    balance.map(async ({ asset, network }) => {
      const priceBRL = await coinMarketCap.getSymbolPrice(asset, network);

      const currentAmount = await blockchain.getTokenBalance({
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
