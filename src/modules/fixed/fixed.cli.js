import fixedService from './fixed.service.js';
import { formatCurrency } from '../../libs/stringFormat.js';
import { formatTable } from '../../libs/cliFormat.js';

const getBalance = async ({ asset }) => {
  const { balance, total } = await fixedService.getBalance(asset);

  const formattedBalance = formatTable(balance, [null, formatCurrency]);

  console.table(formattedBalance);
  console.log({ total });
};

const getTotal = async ({ asset }) => {
  const position = await fixedService.getTotalPosition(asset);

  if (asset) console.log({ asset, position });
  else console.log({ totalPosition: position });
};

const setAssetValue = async ({ asset, value }) => {
  await fixedService.setAssetValue({ asset, value });
  await getTotal({ asset });
};

export default async (command, args) => {
  switch (command) {
    case 'balance':
      await getBalance(args);
      break;

    case 'total':
      await getTotal(args);
      break;

    case 'set-value':
      await setAssetValue(args);
      break;

    default:
      console.error('Invalid command');
      break;
  }
};
