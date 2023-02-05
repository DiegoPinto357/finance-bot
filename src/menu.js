import inquirer from 'inquirer';
import InterruptedPrompt from 'inquirer-interrupted-prompt';
import processScriptMenu from './modules/processScript/processScript.menu';
import portfolioMenu from './modules/portfolio/portfolio.menu';
import crtyptoMenu from './modules/crypto/crypto.menu';
import cacheMenu from './libs/cache.menu';

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

export default {
  init,
  execute,
};
