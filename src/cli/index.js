#!/usr/bin/env node
import 'dotenv/config';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import cryptoContext from './crypto.js';
import stockContext from './stock.js';

(async () => {
  try {
    const argv = yargs(hideBin(process.argv)).argv;
    const [context, command] = argv._;

    switch (context) {
      case 'crypto':
        await cryptoContext(command);
        break;

      case 'stock':
        await stockContext(command);
        break;

      default:
        console.error('Invalid context');
        break;
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
