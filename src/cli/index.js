#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import cryptoContext from './crypto.js';
import stockContext from './stock.js';

const argv = yargs(hideBin(process.argv)).argv;
const [context, command] = argv._;

switch (context) {
  case 'crypto':
    cryptoContext(command);
    break;

  case 'stock':
    stockContext(command);
    break;

  default:
    console.error('Invalid context');
    break;
}
