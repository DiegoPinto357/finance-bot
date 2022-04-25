import mockSheetData from '../mockData/googleSheets/crypto-spot.json';

export const testDataBuffer = mockSheetData.map(row => ({
  ...row,
  _sheet: { headerValues: Object.keys(row) },
  save: jest.fn(),
}));

export const GoogleSpreadsheet = jest.fn().mockImplementation(() => {
  return {
    useServiceAccountAuth: jest.fn(),
    loadInfo: jest.fn(),
    sheetsByTitle: {
      'test-sheet': {
        getRows: jest.fn(() => testDataBuffer),
      },
    },
  };
});
