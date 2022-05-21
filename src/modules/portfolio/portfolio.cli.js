import portfolioService from './portfolio.service';

export default async (command, args) => {
  switch (command) {
    case 'balance':
      const { balance, total: balanceTotal } =
        await portfolioService.getBalance(args.name);

      const flatBalance = [
        ...balance.fixed.balance,
        ...balance.stock.balance,
        ...balance.crypto.balance,
      ];

      console.table(flatBalance);
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
