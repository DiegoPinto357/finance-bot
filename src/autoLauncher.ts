import 'dotenv/config';
import cron from 'node-cron';
import { buildLogger } from './libs/logger';
import cryptoService from './modules/crypto/crypto.service';
import notionDashboard from './modules/notionDashboard';

const log = buildLogger('Auto Launcher');

const updateCryptoHodlTable = async () => {
  await notionDashboard.log(
    `${new Date().toISOString()} - [Auto Launcher]: Updating crypto HODL table`
  );

  const { balance } = await cryptoService.getBalance('hodl');
  await notionDashboard.updateCryptoHodlTable(balance);
};

const run = async () => {
  log('Auto Launcher started');

  try {
    await updateCryptoHodlTable();
  } catch (error) {
    let errorMessage;
    if (error instanceof Error) errorMessage = error.message;
    else errorMessage = String(error);

    await notionDashboard.log(
      `${new Date().toISOString()} - [Auto Launcher]: ${errorMessage}`
    );
    log(errorMessage);
    process.exit(1);
  }
};

(async () => {
  cron.schedule('*/30 * * * *', async () => {
    await run();
  });
})();
