import cryptoService from '../services/crypto.js';

export default async (command, args) => {
  switch (command) {
    case 'balance':
      await cryptoService.getBalance();
      break;

    default:
      console.error('Invalid command');
      break;
  }
};
