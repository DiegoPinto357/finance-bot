import stockService from '../services/stock';
import { formatCurrency, formatPercentage } from '../libs/stringFormat';

export default async (command, args) => {
  switch (command) {
    case 'balance':
      const { balance, total } = await stockService.getBalance(args.type);

      const formatter = [
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
      ];

      const formattedBalance = balance.map(item =>
        Object.entries(item).reduce((obj, [key, value], index) => {
          const formatFunc = formatter[index];
          obj[key] = formatFunc ? formatFunc(value) : value;
          return obj;
        }, {})
      );

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
