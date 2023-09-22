import staking from '../defiCommon/staking';
import autostaking from '../defiCommon/autostaking';
import float from '../defiCommon/float';

const getBalance = async () => {
  const [stakingBalance, autoStakingBalance, floatBalance] = await Promise.all([
    staking.getBalance('defi2'),
    autostaking.getBalance('walletSecondary'),
    float.getBalance('defi2'),
  ]);

  const balance = [...stakingBalance, ...autoStakingBalance, ...floatBalance];

  const total = balance.reduce((total, item) => total + item.positionBRL, 0);

  return { balance, total };
};

const getTotalPosition = async () => (await getBalance()).total;

export default {
  getBalance,
  getTotalPosition,
  getHistory: () => {
    throw new Error('Not implemented');
  },
  deposit: _value => {
    throw new Error('Not implemented');
  },
  sell: _params => {
    throw new Error('Not implemented');
  },
};
