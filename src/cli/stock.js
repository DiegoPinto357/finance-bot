import stockService from '../services/stock';
import { formatCurrency, formatPercentage } from '../libs/stringFormat';
import { formatTable } from '../libs/cliFormat';

export default async (command, args) => {
  switch (command) {
    case 'balance':
      const { balance, total } = await stockService.getBalance(args.type);

      const formattedBalance = formatTable(balance, [
        null,
        null,
        null,
        formatPercentage,
        formatCurrency,
        formatCurrency,
        formatPercentage,
        formatPercentage,
        formatPercentage,
        formatCurrency,
        null,
      ]);

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
