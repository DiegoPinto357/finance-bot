import cryptoDefiStakingSheet from '../mockData/googleSheets/raw/crypto-defi-staking.json';
import distributionSheet from '../mockData/googleSheets/raw/distribution.json';

type RawSheetData = typeof cryptoDefiStakingSheet | typeof distributionSheet;

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
    'crypto-defi-staking': {
      getRows: jest.fn(() => populateRawData(cryptoDefiStakingSheet)),
    },
    distribution: {
      getRows: jest.fn(() => populateRawData(distributionSheet)),
    },
  },
};

export const getConstructorArgs = () => constructorArgs;

export const GoogleSpreadsheet = jest.fn().mockImplementation((...args) => {
  constructorArgs = args;
  return instance;
});
