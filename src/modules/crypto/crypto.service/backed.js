import database from '../../../providers/database';
import mercadoBitcoin from '../../../providers/mercadoBitcoin';

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

const getTotalPosition = async () => {
  const { total } = await getBalance();
  return total;
};

export default {
  getBalance,
  getTotalPosition,
};
