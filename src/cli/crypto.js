import cryptoService from '../services/crypto.js';

export default async (command, args) => {
  switch (command) {
    case 'balance':
      const balance = await cryptoService.getBalance();
      const total = balance.reduce(
        (acc, current) => acc + current.total * current.priceBRL,
        0
      );
      console.log(balance, { total });
      break;

    default:
      console.error('Invalid command');
      break;
  }
};
