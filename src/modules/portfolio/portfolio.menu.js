import inquirer from 'inquirer';
import portfolioService from './portfolio.service';
import { printBalance } from './cliUtils';

const methods = Object.keys(portfolioService);

let portfolios;

const getBalanceMenu = async () => {
  const { portfolioName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'portfolioName',
      message: 'portfolioName?',
      choices: ['all', ...portfolios],
    },
  ]);

  const name = portfolioName !== 'all' ? portfolioName : undefined;
  const { balance, total } = await portfolioService.getBalance(name);
  printBalance(name, balance, total);
};

const getSharesMenu = async () => {
  const { portfolioName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'portfolioName',
      message: 'portfolioName?',
      choices: ['all', ...portfolios],
    },
  ]);

  const name = portfolioName !== 'all' ? portfolioName : undefined;
  const { shares, total } = await portfolioService.getShares(name);

  if (!name) {
    console.dir(shares, { depth: null });
  } else {
    console.table(shares);
  }
  console.log({ total });
};

const init = async () => {
  portfolios = await portfolioService.getPortfolios();
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

    case 'getShares':
      await getSharesMenu();
      break;

    case 'updateAbsoluteTable':
      await portfolioService.updateAbsoluteTable();
      break;

    default:
      console.log('Not implmented');
  }
};

export default {
  init,
  execute,
};
