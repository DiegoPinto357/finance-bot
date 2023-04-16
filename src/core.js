const menu = require('./menu');
const cache = require('./libs/cache');
const database = require('./providers/database');

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

module.exports = {
  init,
};
