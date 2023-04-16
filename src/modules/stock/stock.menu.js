const inquirer = require('inquirer');
const _ = require('lodash');
const stockService = require('./stock.service');
const { formatCurrency, formatPercentage } = require('../../libs/stringFormat');
const { formatTable } = require('../../libs/cliFormat');

const { PortfolioTypes } = stockService;

const methods = Object.keys(stockService);

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
  const { balance, total } = await stockService.getBalance(type);

  // TODO duplication from .cli
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

    case 'analysePortfolio':
      await stockService.analysePortfolio();
      break;

    default:
      console.log('Not implmented');
  }
};

module.exports = {
  execute,
};
