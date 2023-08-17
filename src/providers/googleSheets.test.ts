import * as googleSpreadsheet from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import googleSheets from './googleSheets';
import cache from '../libs/cache';
import * as logger from '../libs/logger';
import mockSheetData from '../../mockData/googleSheets/crypto-spot.json';

type MockGoogleSpreadsheet = typeof googleSpreadsheet & {
  instance: any;
  getConstructorArgs: () => unknown[];
};

type MockLogger = typeof logger & {
  mockLoggerInstance: () => void;
};

const mockGoogleSpreadsheet = googleSpreadsheet as MockGoogleSpreadsheet;
const mockLogger = logger as MockLogger;

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
    expect(mockLogger.mockLoggerInstance).toBeCalledTimes(2);
    expect(mockLogger.mockLoggerInstance).toBeCalledWith(
      'Loadindg sheet secret-of-happyness'
    );
    expect(mockLogger.mockLoggerInstance).toBeCalledWith(
      'Sheet secret-of-happyness not found',
      { severity: 'warn' }
    );
  });

  it('authenticates and load doc only once for multiple sheet loads', async () => {
    await googleSheets.loadSheet('test-sheet');
    await googleSheets.loadSheet('test-sheet');

    const constructorArgs = mockGoogleSpreadsheet.getConstructorArgs();

    expect(constructorArgs).toEqual([
      '1dXeI-yZL4xbjzDBlKxnCyrFbDkJRGsEiq-wRLdNZlFo',
      expect.any(JWT),
    ]);
    expect(mockGoogleSpreadsheet.instance.loadInfo).toBeCalledTimes(1);
  });
});
