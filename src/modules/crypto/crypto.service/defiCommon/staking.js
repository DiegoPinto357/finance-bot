const googleSheets = require('../../../../providers/googleSheets');
const getSymbolPrice = require('./getSymbolPrice');

const getBalance = async assetName => {
  const balance = await googleSheets.loadSheet(`crypto-${assetName}-staking`);

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

module.exports = {
  getBalance,
};
