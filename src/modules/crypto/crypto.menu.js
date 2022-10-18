import inquirer from 'inquirer';
import _ from 'lodash';
import cryptoService, { PortfolioTypes } from './crypto.service';
import { printBalance } from './cliUtils';

const methods = Object.keys(cryptoService);

const getBalanceMenu = async () => {
  const { portfolioName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'portfolioName',
      message: 'portfolioName?',
      choices: PortfolioTypes,
    },
  ]);

  const type = portfolioName !== 'all' ? portfolioName : undefined;
  const { balance, total } = await cryptoService.getBalance(type);
  printBalance(type, balance, total);
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

    default:
  }
};

export default {
  execute,
};
