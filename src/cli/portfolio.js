import portfolioService from '../services/portfolio';

export default async (command, args) => {
  switch (command) {
    case 'balance':
      const { balance, total } = await portfolioService.getBalance(args.name);
      console.log(JSON.stringify(balance, null, 2));
      console.log({ total });
      break;

    case 'total':
      console.error('Invalid command');
      break;

    default:
      console.error('Invalid command');
      break;
  }
};
