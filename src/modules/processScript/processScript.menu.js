import { promises as fs } from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import processScriptFile from './processScriptFile';

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

export default {
  execute,
};
