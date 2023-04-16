const { instance, testDataBuffer } = require('google-spreadsheet');
const googleSheets = require('./googleSheets');
const cache = require('../libs/cache');
const { mockLoggerInstance } = require('../libs/logger');
const mockSheetData = require('../../mockData/googleSheets/crypto-spot.json');

jest.mock('../libs/logger');

describe('googleSheets provider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    googleSheets.resetDoc();
    cache.clear();
  });

  it('loads a sheet', async () => {
    const sheetData = await googleSheets.loadSheet('test-sheet');
    expect(sheetData).toEqual(mockSheetData);
  });

  it('returns an empty array when sheet does not exists', async () => {
    const sheetData = await googleSheets.loadSheet('secret-of-happyness');
    expect(sheetData).toEqual([]);
    expect(mockLoggerInstance).toBeCalledTimes(2);
    expect(mockLoggerInstance).toBeCalledWith(
      'Loadindg sheet secret-of-happyness'
    );
    expect(mockLoggerInstance).toBeCalledWith(
      'Sheet secret-of-happyness not found',
      { severity: 'warn' }
    );
  });

  it('authenticates and load doc only once for multiple sheet loads', async () => {
    await googleSheets.loadSheet('test-sheet');
    await googleSheets.loadSheet('test-sheet');

    expect(instance.useServiceAccountAuth).toBeCalledTimes(1);
    expect(instance.loadInfo).toBeCalledTimes(1);
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
