import cryptoService from '../services/crypto';
import { formatCurrency, formatPercentage } from '../libs/stringFormat';

export default async (command, args) => {
  switch (command) {
    case 'balance':
      const { balance, total } = await cryptoService.getBalance();

      const formatter = [
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
      const totalPosition = await cryptoService.getTotalPosition();
      console.log({ totalPosition });
      break;

    default:
      console.error('Invalid command');
      break;
  }
};
