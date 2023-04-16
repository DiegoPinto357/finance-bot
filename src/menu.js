const inquirer = require('inquirer');
const InterruptedPrompt = require('inquirer-interrupted-prompt');
const processScriptMenu = require('./modules/processScript/processScript.menu');
const portfolioMenu = require('./modules/portfolio/portfolio.menu');
const stockMenu = require('./modules/stock/stock.menu');
const crtyptoMenu = require('./modules/crypto/crypto.menu');
const cacheMenu = require('./libs/cache.menu');

InterruptedPrompt.fromAll(inquirer);

const init = async () => {
  await portfolioMenu.init();
};

const execute = async () => {
  try {
    const { module } = await inquirer.prompt([
      {
        type: 'list',
        name: 'module',
        message: 'Which module?',
        choices: ['scripts', 'portfolio', 'fixed', 'stock', 'crypto', 'cache'],
      },
    ]);

    switch (module) {
      case 'scripts':
        await processScriptMenu.execute();
        break;

      case 'portfolio':
        await portfolioMenu.execute();
        break;

      case 'stock':
        await stockMenu.execute();
        break;

      case 'crypto':
        await crtyptoMenu.execute();
        break;

      case 'cache':
        await cacheMenu.execute();
        break;
    }
  } catch (error) {
    if (error === InterruptedPrompt.EVENT_INTERRUPTED) {
      console.log('\n\nPrompt has been interrupted');
    } else {
      throw error;
    }
  }
};

module.exports = {
  init,
  execute,
};
