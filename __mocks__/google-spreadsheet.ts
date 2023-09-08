import mockSheetData from '../mockData/googleSheets/raw/crypto-defi-staking.json';

type RawSheetData = typeof mockSheetData;

let constructorArgs: unknown;

const populateRawData = (rawData: RawSheetData) => {
  return rawData.map(row => {
    const headerValues = row._worksheet._headerValues;

    return {
      ...row,
      _worksheet: {
        ...row._worksheet,
        headerValues,
      },
      get: jest.fn(key => {
        const index = headerValues.indexOf(key);
        return row._rawData[index];
      }),
    };
  });
};

export const instance = {
  loadInfo: jest.fn(),
  sheetsByTitle: {
    'test-sheet': {
      getRows: jest.fn(() => populateRawData(mockSheetData)),
    },
  },
};

export const getConstructorArgs = () => constructorArgs;

export const GoogleSpreadsheet = jest.fn().mockImplementation((...args) => {
  constructorArgs = args;
  return instance;
});
