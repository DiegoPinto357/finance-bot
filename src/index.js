import menu from './menu';
import cache from './libs/cache';
import database from './providers/database';

// export * as fixed from './modules/fixed/fixed.service';
// export * as stock from './modules/stock/stock.service';
// export * as crypto from './modules/crypto/crypto.service';
// export * as portfolio from './modules/portfolio/portfolio.service';

process.on('SIGINT', async () => {
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

const init = async () => {
  await Promise.all([database.connect(), cache.init(), menu.init()]);
};

export default { init };
