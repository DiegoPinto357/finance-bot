import 'dotenv/config';
import googleSheets from '../providers/googleSheets.js';

(async () => {
  await googleSheets.writeValue('_portfolio-test', {
    index: { key: 'asset', value: 'br' },
    target: { key: 'seguroCarro', value: '42' },
  });
})();
