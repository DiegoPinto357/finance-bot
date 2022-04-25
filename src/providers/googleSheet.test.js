import { GoogleSpreadsheet } from 'google-spreadsheet';
import googleSheets from './googleSheets';
import mockSheetData from '../../mockData/googleSheets/crypto-spot.json';

jest.mock('google-spreadsheet');

const mockGoogleSpreadsheetInstance = GoogleSpreadsheet.mock.instances[0];
mockGoogleSpreadsheetInstance.sheetsByTitle = {
  'test-sheet': {
    getRows: jest.fn(() =>
      mockSheetData.map(row => ({
        ...row,
        _sheet: { headerValues: Object.keys(row) },
      }))
    ),
  },
};

describe('googleSheets provider', () => {
  it('loads a sheet', async () => {
    const sheetData = await googleSheets.loadSheet('test-sheet');
    expect(sheetData).toEqual(mockSheetData);
  });

  it('writes a value in a cell', () => {});
});
