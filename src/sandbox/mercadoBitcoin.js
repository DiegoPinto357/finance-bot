import mercadoBitcoin from '../providers/mercadoBitcoin.js';

const ticker = 'MBPRK07';

(async () => {
  console.log(await mercadoBitcoin.getTicker(ticker));
})();
