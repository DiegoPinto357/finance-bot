import portfolioService from '../services/portfolio';

export default async (command, args) => {
  switch (command) {
    case 'balance':
      const { balance, total } = await portfolioService.getBalance(args.name);
      console.log({ balance, total });
      break;

    case 'total':
      console.error('Invalid command');
      break;

    default:
      console.error('Invalid command');
      break;
  }
};
