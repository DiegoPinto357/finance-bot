import _ from 'lodash';
import cryptoService from './crypto.service';
import { formatBalance } from './uiUtils';

import type { Arguments } from 'yargs';
import type { PortfolioTypes } from './crypto.service';

type Args = Arguments & {
  type: PortfolioTypes;
};

export default async (command: string | number, args: Arguments) => {
  // FIXME remove type cast
  const { type } = args as Args;

  switch (command) {
    case 'balance':
      const { balance, total } = await cryptoService.getBalance(type);
      const formattedBalance = formatBalance(type, balance);
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
