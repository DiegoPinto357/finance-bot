import blockchainScan from '../../providers/blockchainScan';
import coinMarketCap from '../../providers/coinMarketCap';
import googleSheets from '../../providers/GoogleSheets';
import config from '../../config';

const { tokens } = config.crypto;

const assetList = [tokens.titano, tokens.sphere];

const getTokenBalance = async tokenData => {
  const [currentAmount, priceBRL] = await Promise.all([
    blockchainScan.getTokenBalance(tokenData),
    coinMarketCap.getSymbolPrice(tokenData.name),
  ]);

  const { sellFee } = tokenData;
  const positionBRL = currentAmount * priceBRL * (1 - sellFee);

  return {
    asset: tokenData.name,
    currentAmount,
    priceBRL,
    positionBRL,
    sellFee,
  };
};

const getBalanceFromSheet = async () => {
  const balance = await googleSheets.loadSheet('crypto-defi-staking');

  const assets = balance.map(({ asset }) => asset);
  const prices = await Promise.all(
    assets.map(asset => coinMarketCap.getSymbolPrice(asset))
  );

  return balance.map((item, index) => ({
    ...item,
    priceBRL: prices[index],
    positionBRL: item.currentAmount * prices[index] * (1 - item.sellFee),
  }));
};

const getAutoStakingBalance = async () => {
  return await Promise.all(
    assetList.map(async asset => getTokenBalance(asset))
  );
};

const getBalance = async () => {
  const [sheetBalance, autoStakingBalance] = await Promise.all([
    getBalanceFromSheet(),
    getAutoStakingBalance(),
  ]);

  const balance = [...sheetBalance, ...autoStakingBalance];

  const total = balance.reduce((total, item) => total + item.positionBRL, 0);

  return { balance, total };
};

const getTotalPosition = async () => (await getBalance()).total;

export default {
  getBalance,
  getTotalPosition,
};
