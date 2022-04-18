import blockchainScan from '../../providers/blockchainScan';
import coinMarketCap from '../../providers/coinMarketCap';
import config from '../../config';

const { tokens } = config.crypto;

const assetList = [tokens.titano, tokens.sphere];

const getTokenBalance = async tokenData => {
  const [amount, priceBRL] = await Promise.all([
    blockchainScan.getTokenBalance(tokenData),
    coinMarketCap.getSymbolPrice(tokenData.name),
  ]);

  const positionBRL = amount * priceBRL * (1 - tokenData.sellFee);

  return {
    asset: tokenData.name,
    amount,
    priceBRL,
    positionBRL,
  };
};

const getBalance = async () => {
  const balance = await Promise.all(
    assetList.map(async asset => getTokenBalance(asset))
  );

  const total = balance.reduce((total, item) => total + item.positionBRL, 0);

  return { balance, total };
};

const getTotalPosition = async () => (await getBalance()).total;

export default {
  getBalance,
  getTotalPosition,
};
