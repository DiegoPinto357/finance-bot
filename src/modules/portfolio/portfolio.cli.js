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

    case 'swap':
      const { v, portfolio, from, to, l } = args;
      console.log({ portfolio, from, to, l });

      const originItems = from.split('.');
      const origin = { class: originItems[0], name: originItems[1] };

      const destinyItems = to.split('.');
      const destiny = { class: destinyItems[0], name: destinyItems[1] };

      console.log({ origin, destiny });

      const response = await portfolioService.swap(v, {
        portfolio,
        origin,
        destiny,
        liquidity: l,
      });
      console.log(response);
      break;

    case 'update-table':
      await portfolioService.updateAbsoluteTable();
      break;

    default:
      console.error('Invalid command');
      break;
  }
};
