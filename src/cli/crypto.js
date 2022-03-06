import cryptoService from '../services/crypto.js';

export default async (command, args) => {
  switch (command) {
    case 'balance':
      const balance = await cryptoService.getBalance();
      const totalBRL = balance.reduce(
        (acc, current) => acc + current.total * current.priceBRL,
        0
      );
      console.table(balance);
      console.log({ total: totalBRL });
      break;

    default:
      console.error('Invalid command');
      break;
  }
};
