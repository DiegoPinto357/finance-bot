import googleSheets from '../../../../providers/GoogleSheets';
import coinMarketCap from '../../../../providers/coinMarketCap';

const getBalance = async assetName => {
  const balance = await googleSheets.loadSheet(`crypto-${assetName}-staking`);

  const prices = await Promise.all(
    balance.map(({ asset, network }) =>
      coinMarketCap.getSymbolPrice(asset, network)
    )
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
