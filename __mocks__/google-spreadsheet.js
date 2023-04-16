const mockSheetData = require('../mockData/googleSheets/crypto-spot.json');

const testDataBuffer = mockSheetData.map(row => ({
  ...row,
  _sheet: { headerValues: Object.keys(row) },
  save: jest.fn(),
}));

const instance = {
  useServiceAccountAuth: jest.fn(),
  loadInfo: jest.fn(),
  sheetsByTitle: {
    'test-sheet': {
      getRows: jest.fn(() => testDataBuffer),
    },
  },
};

const GoogleSpreadsheet = jest.fn().mockImplementation(() => instance);

module.exports = {
  GoogleSpreadsheet,
  testDataBuffer,
  instance,
};
