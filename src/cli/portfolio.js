import portfolioService from '../services/portfolio';

export default async (command, args) => {
  switch (command) {
    case 'balance':
      const { balance, total: balanceTotal } =
        await portfolioService.getBalance(args.name);

      console.table(balance);
      console.log({ balanceTotal });
      break;

    case 'shares':
      const { shares, total } = await portfolioService.getShares(args.name);

      console.table(shares);
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
