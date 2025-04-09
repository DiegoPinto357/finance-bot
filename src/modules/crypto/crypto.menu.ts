import inquirer from 'inquirer';
import _ from 'lodash';
import cryptoService, { portfolioTypes } from './crypto.service';
import { formatBalance } from './uiUtils';

const methods = Object.keys(cryptoService);

const getBalanceMenu = async () => {
  const { portfolioName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'portfolioName',
      message: 'portfolioName?',
      choices: portfolioTypes,
    },
  ]);

  const type = portfolioName !== 'all' ? portfolioName : undefined;
  const { balance, total } = await cryptoService.getBalance(type);
  const formattedBalance = formatBalance(type, balance);
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
    case 'executeHODLBot':
      await cryptoService.executeHODLBot();
      break;

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
