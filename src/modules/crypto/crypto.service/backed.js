import database from '../../../providers/database';
import mercadoBitcoin from '../../../providers/mercadoBitcoin';

const getBalance = async () => {
  const assets = await database.find(
    'assets',
    'crypto',
    { location: 'mercadoBitcoin', type: 'backed' },
    { projection: { _id: 0 } }
  );

  const balance = await Promise.all(
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
