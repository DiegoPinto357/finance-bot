import cryptoService from '../services/crypto.js';

export default async (command, args) => {
  switch (command) {
    case 'balance':
      const balance = await cryptoService.getBalance();
      console.log(balance);
      break;

    default:
      console.error('Invalid command');
      break;
  }
};
