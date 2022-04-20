import blockchainScan from '../../../providers/blockchainScan';
import coinMarketCap from '../../../providers/coinMarketCap';
import googleSheets from '../../../providers/GoogleSheets';

const getTokenBalanceFromBlockchain = async tokenData => {
  const { asset, network, contract, sellFee } = tokenData;
  const [currentAmount, priceBRL] = await Promise.all([
    blockchainScan.getTokenBalance({ asset, network, contract }),
    coinMarketCap.getSymbolPrice(asset),
  ]);

  const positionBRL = currentAmount * priceBRL * (1 - sellFee);

  return {
    currentAmount,
    priceBRL,
    positionBRL,
  };
};

const getStakingBalance = async () => {
  const balance = await googleSheets.loadSheet('crypto-defi-staking');

  const assets = balance.map(({ asset }) => asset);
  const prices = await Promise.all(
    assets.map(asset => coinMarketCap.getSymbolPrice(asset))
  );

  return balance.map((item, index) => ({
    type: 'staking',
    ...item,
    priceBRL: prices[index],
    positionBRL: item.currentAmount * prices[index] * (1 - item.sellFee),
  }));
};

const getAutoStakingBalance = async () => {
  const tokens = await googleSheets.loadSheet('crypto-defi-autostaking');
  const balance = await Promise.all(
    tokens.map(async asset => getTokenBalanceFromBlockchain(asset))
  );

  return tokens.map((token, index) => {
    const { asset, description, depositBRL, depositAmount, sellFee } = token;
    const { currentAmount, priceBRL, positionBRL } = balance[index];
    return {
      type: 'autostaking',
      asset,
      description,
      depositBRL,
      depositAmount,
      currentAmount,
      sellFee,
      endDate: undefined,
      priceBRL,
      positionBRL,
    };
  });
};

const getBalance = async () => {
  const [sheetBalance, autoStakingBalance] = await Promise.all([
    getStakingBalance(),
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
