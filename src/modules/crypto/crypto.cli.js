const _ = require('lodash');
const cryptoService = require('./crypto.service');
const { formatBalance } = require('./uiUtils');
const { formatCurrency, formatPercentage } = require('../../libs/stringFormat');
const { formatTable } = require('../../libs/cliFormat');

module.exports = async (command, args) => {
  const { type } = args;

  switch (command) {
    case 'balance':
      const { balance, total } = await cryptoService.getBalance(type);
      const formattedBalance = formatBalance(type, balance);
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
