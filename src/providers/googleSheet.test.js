import { GoogleSpreadsheet, testDataBuffer } from 'google-spreadsheet';
import googleSheets from './googleSheets';
import mockSheetData from '../../mockData/googleSheets/crypto-spot.json';

describe('googleSheets provider', () => {
  it('loads a sheet', async () => {
    const sheetData = await googleSheets.loadSheet('test-sheet');
    expect(sheetData).toEqual(mockSheetData);
  });

  it('writes a value in a cell', async () => {
    await googleSheets.writeValue('test-sheet', {
      index: { key: 'asset', value: 'BTC' },
      target: { key: 'score', value: 20 },
    });

    const changedRow = testDataBuffer.find(row => row.asset === 'BTC');

    expect(changedRow.save).toBeCalledTimes(1);
    expect(changedRow.score).toEqual(20);
  });
});
