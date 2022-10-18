import _ from 'lodash';
import cryptoService from './crypto.service';
import { printBalance } from './cliUtils';
import { formatCurrency, formatPercentage } from '../../libs/stringFormat';
import { formatTable } from '../../libs/cliFormat';

export default async (command, args) => {
  const { type } = args;

  switch (command) {
    case 'balance':
      const { balance, total } = await cryptoService.getBalance(type);
      printBalance(type, balance, total);
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
