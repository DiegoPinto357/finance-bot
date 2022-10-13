import googleSheets from '../../../../providers/GoogleSheets';
import staking from '../defiCommon/staking';
import autostaking from '../defiCommon/autostaking';
import float from '../defiCommon/float';
import liquidityPool from '../defiCommon/liquidityPool';

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

const getBalance = async () => {
  const [
    stakingBalance,
    autoStakingBalance,
    liquidityPoolBalance,
    floatBalance,
  ] = await Promise.all([
    staking.getBalance('defi'),
    autostaking.getBalance('walletPrimary'),
    getLiquidityPoolBalance(),
    float.getBalance('defi'),
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
