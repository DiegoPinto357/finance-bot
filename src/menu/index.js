import inquirer from 'inquirer';
import portfolioMenu from '../modules/portfolio/portfolio.menu';
import crtyptoMenu from '../modules/crypto/crypto.menu';

export default async () => {
  const { module } = await inquirer.prompt([
    {
      type: 'list',
      name: 'module',
      message: 'Which module?',
      choices: ['scripts', 'portfolio', 'fixed', 'stock', 'crypto'],
    },
  ]);

  switch (module) {
    case 'portfolio':
      await portfolioMenu();

    case 'crypto':
      await crtyptoMenu();
  }
};
