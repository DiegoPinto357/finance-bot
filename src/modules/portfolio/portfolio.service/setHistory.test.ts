import database from '../../../providers/database';
import getBalance from './getBalance';
import setHistory from './setHistory';
import balanceData from '../../../../mockData/portfolio/balance';

jest.mock('../../../providers/database');
jest.mock('./getBalance');

jest.useFakeTimers().setSystemTime(new Date('2024-12-22T10:24:05.357-03:00'));

jest.mocked(getBalance).mockResolvedValue(balanceData);

describe('portfolio service - setHistory', () => {
  it('registers a history entry with current balance', async () => {
    await setHistory();

    expect(database.insertOne).toHaveBeenCalledTimes(1);
    expect(database.insertOne).toHaveBeenCalledWith('portfolio', 'history', {
      date: '2024-12-22',
      portfolios: {
        amortecedor: 13116.49418188534,
        carro: 7524.634808547004,
        congelamentoSuricats: 245.5031239331471,
        financiamento: 32318.19989598653,
        impostos: 647.8010672458122,
        macbookFirma: 4451.288458910645,
        manutencaoCarro: 2735.854409515535,
        previdencia: 53843.90368550462,
        reformaCasa: 6672.741693574558,
        rendaPassiva: 0,
        reservaEmergencia: 36666.614203082674,
        seguroCarro: 1860.4013026489647,
        suricat: 13444.165235400875,
        viagem: 2809.2664230105447,
      },
    });
  });
});
