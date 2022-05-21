import fixedService from './fixed.service';
import { formatCurrency } from '../../libs/stringFormat';
import { formatTable } from '../../libs/cliFormat';

export default async (command, args) => {
  const { type } = args;

  switch (command) {
    case 'balance':
      const { balance, total } = await fixedService.getBalance(type);

      const formattedBalance = formatTable(balance, [null, formatCurrency]);

      console.table(formattedBalance);
      console.log({ total });
      break;

    case 'total':
      const totalPosition = await fixedService.getTotalPosition(type);
      console.log({ totalPosition });
      break;

    default:
      console.error('Invalid command');
      break;
  }
};
