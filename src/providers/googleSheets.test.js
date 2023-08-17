import {
  instance,
  testDataBuffer,
  getConstructorArgs,
} from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import googleSheets from './googleSheets';
import cache from '../libs/cache';
import { mockLoggerInstance } from '../libs/logger';
import mockSheetData from '../../mockData/googleSheets/crypto-spot.json';

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

    const constructorArgs = getConstructorArgs();

    expect(constructorArgs).toEqual([
      '1dXeI-yZL4xbjzDBlKxnCyrFbDkJRGsEiq-wRLdNZlFo',
      expect.any(JWT),
    ]);
    expect(instance.loadInfo).toBeCalledTimes(1);
  });
});
