import fixedService from '../services/fixed';
import { formatCurrency } from '../libs/stringFormat';
import { formatTable } from '../libs/cliFormat';

export default async (command, args) => {
  switch (command) {
    case 'balance':
      const { balance, total } = await fixedService.getBalance(args.type);

      const formattedBalance = formatTable(balance, [null, formatCurrency]);

      console.table(formattedBalance);
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
