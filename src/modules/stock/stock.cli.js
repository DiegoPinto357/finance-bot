import stockService from './stock.service';
import { formatCurrency, formatPercentage } from '../../libs/stringFormat';
import { formatTable } from '../../libs/cliFormat';

export default async (command, args) => {
  const { type } = args;

  switch (command) {
    case 'balance':
      const { balance, total } = await stockService.getBalance(type);

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
      const totalPosition = await stockService.getTotalPosition(type);
      console.log({ totalPosition });
      break;

    default:
      console.error('Invalid command');
      break;
  }
};
