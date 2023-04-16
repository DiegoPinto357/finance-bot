#!/usr/bin/env node
require('dotenv/config');
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const menu = require('./menu');
const core = require('./core');
const cryptoContext = require('./modules/crypto/crypto.cli');
const stockContext = require('./modules/stock/stock.cli');
const fixedContext = require('./modules/fixed/fixed.cli');
const portfolioContext = require('./modules/portfolio/portfolio.cli');
const processScriptContext = require('./modules/processScript/processScript.cli');

(async () => {
  await core.init();

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
