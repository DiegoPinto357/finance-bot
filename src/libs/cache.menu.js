import inquirer from 'inquirer';
import _ from 'lodash';
import { clearCache } from './cache';

const methods = ['clearCache'];

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
    case 'clearCache':
      clearCache();
      break;

    default:
      console.log('Not implmented');
  }
};

export default {
  execute,
};
