const inquirer = require('inquirer');
const _ = require('lodash');
const cache = require('./cache');

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

module.exports = {
  execute,
};
