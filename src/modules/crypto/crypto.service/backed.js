const database = require('../../../providers/database');
const mercadoBitcoin = require('../../../providers/mercadoBitcoin');

const getBalance = async () => {
  const assets = await database.find(
    'assets',
    'crypto',
    { location: 'mercadoBitcoin', type: 'backed' },
    { projection: { _id: 0 } }
  );

  const balanceTokens = await Promise.all(
    assets.map(async ({ asset, amount }) => {
      const { last } = await mercadoBitcoin.getTicker(asset);
      const priceBRL = parseFloat(last);
      const positionBRL = amount * priceBRL;
      return {
        asset: asset,
        position: amount,
        priceBRL,
        positionBRL,
      };
    })
  );

  const [float] = (
    await database.find(
      'assets',
      'crypto',
      { location: 'mercadoBitcoin', type: 'float' },
      { projection: { _id: 0 } }
    )
  ).map(({ asset, amount }) => ({
    asset,
    position: amount,
    priceBRL: 1,
    positionBRL: amount,
  }));

  const balance = [...balanceTokens, float];

  const total = balance.reduce((sum, { positionBRL }) => sum + positionBRL, 0);

  return { balance, total };
};

const getTotalPosition = async asset => {
  const { balance, total } = await getBalance();

  if (!asset) {
    return total;
  }

  return balance.find(item => item.asset === asset).positionBRL;
};

const deposit = async ({ asset, value }) => {
  asset = asset ? asset : 'BRL';

  if (asset !== 'BRL') {
    return { status: 'cannotDepositValue' };
  }

  const currentValue = await getTotalPosition(asset);
  const newValue = currentValue + value;

  if (newValue < 0) {
    return { status: 'notEnoughFunds' };
  }

  await database.updateOne(
    'assets',
    'crypto',
    { asset, location: 'mercadoBitcoin', type: 'float', asset },
    { $set: { amount: newValue } }
  );

  return { status: 'ok' };
};

module.exports = {
  getBalance,
  getTotalPosition,
  deposit,
};
