const inquirer = require('inquirer');
const _ = require('lodash');
const cryptoService = require('./crypto.service');
const { printBalance } = require('./cliUtils');

const { PortfolioTypes } = cryptoService;

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
      break;

    default:
      console.log('Not implmented');
  }
};

module.exports = {
  execute,
};
