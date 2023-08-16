import httpClient from '../libs/httpClient';
import blockchain from './blockchain';

jest.mock('../libs/httpClient');

describe('blockchain', () => {
  it('gets a token balance', async () => {
    (
      httpClient.get as jest.MockedFunction<typeof httpClient.get>
    ).mockResolvedValue({ status: 1, result: 1000000000000000000000 });

    const result = await blockchain.getTokenBalance({
      asset: 'BNB',
      network: 'bsc',
      wallet: '0x4bfd7472b7f4f9a3a46b0dba3a24ff2e0a1e7364',
    });

    expect(result).toBeCloseTo(1000, 8);
  });

  it('gets a contract total supply', async () => {
    (
      httpClient.get as jest.MockedFunction<typeof httpClient.get>
    ).mockResolvedValue({ status: 1, result: 99000000000000000000000 });

    const result = await blockchain.getContractTokenTotalSupply({
      network: 'bsc',
      contractAddress: '0xcdfd91eea657cc2701117fe9711c9a4f61feed23',
    });

    expect(result).toBeCloseTo(99000, 8);
  });
});
