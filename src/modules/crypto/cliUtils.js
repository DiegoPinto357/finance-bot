import _ from 'lodash';
import { formatCurrency, formatPercentage } from '../../libs/stringFormat';
import { formatTable } from '../../libs/cliFormat';

const getBalanceFormatter = type => {
  switch (type) {
    case 'hodl':
      return [
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

    case 'defi':
    case 'defi2':
      return [
        null,
        null,
        null,
        formatCurrency,
        null,
        null,
        formatPercentage,
        formatPercentage,
        null,
        formatCurrency,
        formatCurrency,
      ];

    default:
      return [];
  }
};

export const printBalance = (type, balance, total) => {
  const formatter = getBalanceFormatter(type);
  const formattedBalance = formatTable(
    balance.map(item => _.omit(item, 'network')),
    formatter
  );

  console.table(formattedBalance);
  console.log({ total });
};
