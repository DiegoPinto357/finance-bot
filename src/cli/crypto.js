import cryptoService from '../services/crypto';
import { formatCurrency, formatPercentage } from '../libs/stringFormat';
import { formatTable } from '../libs/cliFormat';

export default async (command, args) => {
  switch (command) {
    case 'balance':
      const { balance, total } = await cryptoService.getBalance();

      const formattedBalance = formatTable(balance, [
        null,
        null,
        null,
        null,
        null,
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
      const totalPosition = await cryptoService.getTotalPosition();
      console.log({ totalPosition });
      break;

    case 'history':
      const history = await cryptoService.getHistory();

      const formattedHistory = formatTable(history, [
        null,
        formatCurrency,
        formatCurrency,
        formatCurrency,
        formatPercentage,
      ]);

      console.table(formattedHistory);
      break;

    default:
      console.error('Invalid command');
      break;
  }
};
