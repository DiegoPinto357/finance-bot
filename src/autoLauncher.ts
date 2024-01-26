import 'dotenv/config';
import { buildLogger } from './libs/logger';
import cryptoService from './modules/crypto/crypto.service';
import notionDashboard from './modules/notionDashboard';

const log = buildLogger('Auto Launcher');

(async () => {
  log('Auto Launcher started');

  try {
    await notionDashboard.log(
      `${new Date().toISOString()} - [Auto Launcher]: Updating crypto HODL table`
    );

    const { balance } = await cryptoService.getBalance('hodl');
    await notionDashboard.updateCryptoHodlTable(balance);

    process.exit(0);
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
})();
