import inquirer from 'inquirer';
import _ from 'lodash';
import cryptoService from './crypto.service';
import { formatCurrency, formatPercentage } from '../../libs/stringFormat';
import { formatTable } from '../../libs/cliFormat';

const methods = Object.keys(cryptoService);

// TODO duplication from crypto.cli
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

const getBalanceMenu = async () => {
  const { portfolioName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'portfolioName',
      message: 'portfolioName?',
      // TODO get assets list from service
      choices: ['hodl', 'defi', 'defi2', 'backed'],
    },
  ]);

  const type = portfolioName !== 'all' ? portfolioName : undefined;

  // TODO duplication from crypto.cli
  const { balance, total } = await cryptoService.getBalance(type);

  const formatter = getBalanceFormatter(type);
  const formattedBalance = formatTable(
    balance.map(item => _.omit(item, 'network')),
    formatter
  );

  console.table(formattedBalance);
  console.log({ total });
};

export default async () => {
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
