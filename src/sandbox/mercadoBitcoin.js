// npx ts-node src/sandbox/mercadoBitcoin.js
import mercadoBitcoin from '../providers/mercadoBitcoin.ts';

const ticker = 'MBCCSH18';

(async () => {
  console.log(await mercadoBitcoin.getTicker(ticker));
})();
