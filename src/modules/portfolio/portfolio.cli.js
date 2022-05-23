import portfolioService from './portfolio.service';

export default async (command, args) => {
  const { name } = args;

  switch (command) {
    case 'balance':
      const { balance, total: balanceTotal } =
        await portfolioService.getBalance(name);

      if (!name) {
        console.log(JSON.stringify(balance, null, 2));
        console.log(balanceTotal);
        break;
      }

      const flatBalance = [
        ...balance.fixed.balance,
        ...balance.stock.balance,
        ...balance.crypto.balance,
      ];

      console.table(flatBalance);
      console.log({ balanceTotal });
      break;

    case 'shares':
      const { shares, total } = await portfolioService.getShares(name);

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
