import cryptoService from '../services/crypto';
import { formatCurrency, formatPercentage } from '../libs/stringFormat';

export default async (command, args) => {
  switch (command) {
    case 'balance':
      const { balance, total } = await cryptoService.getBalance();

      const balanceFormatter = [
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
      ];

      // TODO create a help format function
      const formattedBalance = balance.map(item =>
        Object.entries(item).reduce((obj, [key, value], index) => {
          const formatFunc = balanceFormatter[index];
          obj[key] = formatFunc ? formatFunc(value) : value;
          return obj;
        }, {})
      );

      console.table(formattedBalance);
      console.log({ total });
      break;

    case 'total':
      const totalPosition = await cryptoService.getTotalPosition();
      console.log({ totalPosition });
      break;

    case 'history':
      const history = await cryptoService.getHistory();

      const historyFormatter = [
        null,
        formatCurrency,
        formatCurrency,
        formatCurrency,
        formatPercentage,
      ];

      // TODO create a help format function
      const formattedHistory = history.map(item =>
        Object.entries(item).reduce((obj, [key, value], index) => {
          const formatFunc = historyFormatter[index];
          obj[key] = formatFunc ? formatFunc(value) : value;
          return obj;
        }, {})
      );

      console.table(formattedHistory);
      break;

    default:
      console.error('Invalid command');
      break;
  }
};
