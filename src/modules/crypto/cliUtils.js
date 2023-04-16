const _ = require('lodash');
const { formatCurrency, formatPercentage } = require('../../libs/stringFormat');
const { formatTable } = require('../../libs/cliFormat');

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
const printBalance = (type, balance, total) => {
  const formatter = getBalanceFormatter(type);
  const formattedBalance = formatTable(
    balance.map(item => _.omit(item, 'network')),
    formatter
  );

  console.table(formattedBalance);
  console.log({ total });
};

module.exports = {
  printBalance,
};
