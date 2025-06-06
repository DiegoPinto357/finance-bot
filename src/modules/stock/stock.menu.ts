import inquirer from 'inquirer';
import _ from 'lodash';
import stockService from './stock.service';
import { formatCurrency, formatPercentage } from '../../libs/stringFormat';
import { formatTable } from '../../libs/cliFormat';
import { STOCK_ASSET_TYPE } from '../../schemas';

const methods = Object.keys(stockService);

const getBalanceMenu = async () => {
  const { portfolioName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'portfolioName',
      message: 'portfolioName?',
      choices: STOCK_ASSET_TYPE,
    },
  ]);

  const type = portfolioName !== 'all' ? portfolioName : undefined;
  const { balance, total } = await stockService.getBalance(type);

  // TODO duplication from .cli
  if (balance) {
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
  }
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

export default {
  execute,
};
