import cryptoService from '../services/crypto.js';
import { formatCurrency, formatPercentage } from '../libs/stringFormat.js';

export default async (command, args) => {
  switch (command) {
    case 'balance':
      const balance = await cryptoService.getBalance();

      // TODO add service to get the total
      const totalBRL = balance.reduce(
        (acc, current) => acc + current.total * current.priceBRL,
        0
      );

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
      console.log({ total: totalBRL });
      break;

    default:
      console.error('Invalid command');
      break;
  }
};
