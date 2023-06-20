import inquirer from 'inquirer';
import fixedService from './fixed.service';
import { formatCurrency } from '../../libs/stringFormat';
import { formatTable } from '../../libs/cliFormat';

const methods = Object.keys(fixedService);

const getBalanceMenu = async () => {
  const assetsList = await fixedService.getAssetsList();
  const { portfolioName: asset } = await inquirer.prompt([
    {
      type: 'list',
      name: 'portfolioName',
      message: 'portfolioName?',
      choices: ['all', ...assetsList],
    },
  ]);

  const assetName = asset !== 'all' ? asset : undefined;
  const { balance, total } = await fixedService.getBalance(assetName);

  // TODO duplication from .cli
  const formattedBalance = formatTable(balance, [null, formatCurrency]);

  console.table(formattedBalance);
  console.log({ total });
};

const execute = async () => {
  const { method } = await inquirer.prompt([
    {
      type: 'list',
      name: 'method',
      message: 'Which method?',
      choices: methods,
    },
  ]);

  switch (method) {
    case 'getBalance':
      await getBalanceMenu();
      break;

    default:
      console.log('Not implmented');
  }
};

export default {
  execute,
};
