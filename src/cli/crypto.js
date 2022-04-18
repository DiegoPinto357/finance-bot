import cryptoService from '../services/crypto';
import { formatCurrency, formatPercentage } from '../libs/stringFormat';
import { formatTable } from '../libs/cliFormat';

export default async (command, args) => {
  const { type } = args;

  switch (command) {
    case 'balance':
      const { balance, total } = await cryptoService.getBalance(type);

      const formatter =
        type === 'hodl'
          ? [
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
            ]
          : [];

      const formattedBalance = formatTable(balance, formatter);

      console.table(formattedBalance);
      console.log({ total });
      break;

    case 'total':
      const totalPosition = await cryptoService.getTotalPosition(type);
      console.log({ totalPosition });
      break;

    case 'history':
      const history = await cryptoService.getHistory(type);

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
