import stockService from './stock.service';
import { formatCurrency, formatPercentage } from '../../libs/stringFormat';
import { formatTable } from '../../libs/cliFormat';

const getBalance = async ({ type }) => {
  const { balance, total } = await stockService.getBalance(type);

  const formattedBalance = formatTable(balance, [
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
  ]);

  console.table(formattedBalance);
  console.log({ total });
};

const getTotal = async ({ type }) => {
  const position = await stockService.getTotalPosition(type);

  if (type) console.log({ type, position });
  else console.log({ position });
};

export default async (command, args) => {
  switch (command) {
    case 'balance':
      await getBalance(args);
      break;

    case 'total':
      await getTotal(args);
      break;

    default:
      console.error('Invalid command');
      break;
  }
};
