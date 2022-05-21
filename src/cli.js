#!/usr/bin/env node
import 'dotenv/config';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import cryptoContext from './modules/crypto/crypto.cli';
import stockContext from './modules/stock/stock.cli';
import fixedContext from './modules/fixed/fixed.cli';
import portfolioContext from './modules/portfolio/portfolio.cli';

(async () => {
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

      default:
        console.error('Invalid command');
        break;
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
