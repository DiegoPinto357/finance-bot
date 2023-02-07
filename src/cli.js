#!/usr/bin/env node
import 'dotenv/config';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import menu from './menu';
import cache from './libs/cache';
import database from './providers/database';
import cryptoContext from './modules/crypto/crypto.cli';
import stockContext from './modules/stock/stock.cli';
import fixedContext from './modules/fixed/fixed.cli';
import portfolioContext from './modules/portfolio/portfolio.cli';
import processScriptContext from './modules/processScript/processScript.cli';

process.on('SIGINT', async code => {
  try {
    await handleExit();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});

const handleExit = async () => {
  await cache.saveData();
  database.close();
};

(async () => {
  await Promise.all([database.connect(), cache.init(), menu.init()]);

  try {
    const argv = yargs(hideBin(process.argv)).argv;
    const [context, command] = argv._;

    switch (context) {
      case 'crypto':
        await cryptoContext(command, argv);
        break;

      case 'stock':
        await stockContext(command, argv);
        break;

      case 'fixed':
        await fixedContext(command, argv);
        break;

      case 'portfolio':
        await portfolioContext(command, argv);
        break;

      case 'process':
        await processScriptContext(argv);
        break;

      default:
        while (true) {
          console.log(
            '\n----------------------------------------------------------------\n'
          );
          await menu.execute();
        }
    }

    await handleExit();
    process.exit(0);
  } catch (error) {
    console.error(error);
    await handleExit();
    process.exit(1);
  }
})();
