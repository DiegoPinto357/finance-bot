import binanceBuffer from './binanceBuffer';

jest.mock('../../../providers/database');
jest.mock('../../../providers/binance');

describe('crypto binanceBuffer service', () => {
  describe('getTotalPosition', () => {
    it('gets total position', async () => {
      const balance = await binanceBuffer.getTotalPosition();
      expect(balance).toBe(2156.375642691);
    });
  });
});
