const { promises: fs } = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const processScriptFile = require('./processScriptFile');

const scriptsFolder = 'scripts';

const execute = async () => {
  const scriptsList = await fs.readdir(scriptsFolder);

  const { scriptFile } = await inquirer.prompt([
    {
      type: 'list',
      name: 'scriptFile',
      message: 'Which script?',
      choices: scriptsList,
    },
  ]);

  const filename = path.join(scriptsFolder, scriptFile);
  return await processScriptFile(filename);
};

module.exports = {
  execute,
};
