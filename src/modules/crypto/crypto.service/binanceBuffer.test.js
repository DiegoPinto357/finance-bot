import binanceBuffer from './binanceBuffer';

jest.mock('../../../providers/database');
jest.mock('../../../providers/binance');

describe('crypto binanceBuffer service', () => {
  describe('getTotalPosition', () => {
    it('gets total position', async () => {
      const total = await binanceBuffer.getTotalPosition();
      expect(total).toBe(2156.375642691);
    });

    it('gets total posotion for a given asset', async () => {
      const total = await binanceBuffer.getTotalPosition('BRL');
      expect(total).toBe(6.8284);
    });
  });
});
