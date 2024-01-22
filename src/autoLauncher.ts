import 'dotenv/config';
import { buildLogger } from './libs/logger';
import cryptoService from './modules/crypto/crypto.service';
import notionDashboard from './modules/notionDashboard';

const log = buildLogger('Auto Launcher');

(async () => {
  log('Auto Launcher started');

  // await notionDashboard.log(
  //   `${new Date().toISOString()} - [Module name]: Message`
  // );

  const { balance } = await cryptoService.getBalance('hodl');
  await notionDashboard.updateCryptoHodlTable(balance);
})();
