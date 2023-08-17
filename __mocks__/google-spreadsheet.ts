import mockSheetData from '../mockData/googleSheets/crypto-spot.json';

let constructorArgs: unknown;

const testDataBuffer = mockSheetData.map(row => {
  const headerValues = Object.keys(row);
  const _rawData = Object.values(row);
  return {
    ...row,
    _worksheet: { headerValues },
    _rawData,
    save: jest.fn(),
    get: jest.fn(key => {
      const index = headerValues.indexOf(key);
      return _rawData[index];
    }),
  };
});

export const instance = {
  loadInfo: jest.fn(),
  sheetsByTitle: {
    'test-sheet': {
      getRows: jest.fn(() => testDataBuffer),
    },
  },
};

export const getConstructorArgs = () => constructorArgs;

export const GoogleSpreadsheet = jest.fn().mockImplementation((...args) => {
  constructorArgs = args;
  return instance;
});
