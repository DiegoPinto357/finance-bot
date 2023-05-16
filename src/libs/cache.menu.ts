import inquirer from 'inquirer';
import _ from 'lodash';
import cache from './cache';

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
      cache.clear();
      break;

    default:
      console.log('Not implmented');
  }
};

export default {
  execute,
};
