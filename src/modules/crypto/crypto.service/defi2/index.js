const staking = require('../defiCommon/staking');
const autostaking = require('../defiCommon/autostaking');
const float = require('../defiCommon/float');

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

module.exports = {
  getBalance,
  getTotalPosition,
  getHistory: () => {
    throw new Error('Not implemented');
  },
  deposit: _value => {
    throw new Error('Not implemented');
  },
};
