import blockchain from '../../../../providers/blockchain';
import coinMarketCap from '../../../../providers/coinMarketCap';
import googleSheets from '../../../../providers/GoogleSheets';
import liquidityPool from './liquidityPool';

const getTokenBalanceFromBlockchain = async tokenData => {
  const { asset, network, sellFee } = tokenData;
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

const getStakingBalance = async () => {
  const balance = await googleSheets.loadSheet('crypto-defi-staking');
  const prices = await Promise.all(
    balance.map(({ asset, network }) =>
      coinMarketCap.getSymbolPrice(asset, network)
    )
  );

  return balance.map((item, index) => ({
    type: 'staking',
    ...item,
    performanceFee: undefined,
    priceBRL: prices[index],
    positionBRL: item.currentAmount * prices[index] * (1 - item.sellFee),
  }));
};

const getAutoStakingBalance = async () => {
  const tokens = await googleSheets.loadSheet('crypto-defi-autostaking');
  const balance = await Promise.all(
    tokens.map(asset => getTokenBalanceFromBlockchain(asset))
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
      performanceFee: undefined,
      endDate: undefined,
      priceBRL,
      positionBRL,
    };
  });
};

const getLiquidityPoolBalance = async () => {
  const pools = await googleSheets.loadSheet('crypto-defi-liquiditypool');

  return await Promise.all(
    pools.map(async pool => {
      const {
        asset,
        network,
        contractAddress,
        currentAmount,
        depositBRL,
        depositAmount,
        withdrawalFee,
        performanceFee,
      } = pool;

      const priceBRL = await liquidityPool.getLPTokenPrice({
        lpToken: asset,
        network,
        contractAddress,
      });

      const positionBRL = priceBRL * currentAmount;

      return {
        type: 'liquiditypool',
        asset,
        description: `${asset.split('-').slice(0, 2).join('/')} liquidity pool`,
        depositBRL,
        depositAmount,
        currentAmount,
        sellFee: withdrawalFee,
        performanceFee,
        endDate: undefined,
        priceBRL,
        positionBRL,
      };
    })
  );
};

const getFloatBalance = async () => {
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

const getBalance = async () => {
  const [
    stakingBalance,
    autoStakingBalance,
    liquidityPoolBalance,
    floatBalance,
  ] = await Promise.all([
    getStakingBalance(),
    getAutoStakingBalance(),
    getLiquidityPoolBalance(),
    getFloatBalance(),
  ]);

  const balance = [
    ...stakingBalance,
    ...autoStakingBalance,
    ...liquidityPoolBalance,
    ...floatBalance,
  ];

  const total = balance.reduce((total, item) => total + item.positionBRL, 0);

  return { balance, total };
};

const getTotalPosition = async () => (await getBalance()).total;

export default {
  getBalance,
  getTotalPosition,
};
