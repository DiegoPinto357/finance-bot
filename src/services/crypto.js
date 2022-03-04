import { GoogleSpreadsheet } from 'google-spreadsheet';
import { formatPercentage, formatCurrency } from '../libs/stringFormat.js';

const numOfCols = 13;

const buildTableHeader = sheet =>
  new Array(numOfCols)
    .fill()
    .map((_cell, colIndex) => sheet.getCell(0, colIndex).value);

const buildTableRow = (sheet, header, index) =>
  new Array(numOfCols).fill().reduce((obj, _cell, colIndex) => {
    const value = sheet.getCell(index + 1, colIndex).value;

    const formatFunc = formatter[colIndex];
    obj[header[colIndex]] = formatFunc ? formatFunc(value) : value;

    return obj;
  }, {});

const buildTable = sheet => {
  const header = buildTableHeader(sheet);

  return new Array(15)
    .fill()
    .map((_row, rowIndex) => buildTableRow(sheet, header, rowIndex));
};

const formatter = [
  null,
  formatPercentage,
  formatCurrency,
  null,
  null,
  null,
  null,
  formatCurrency,
  formatPercentage,
  formatPercentage,
  formatPercentage,
  formatCurrency,
];

const getBalance = async () => {
  const doc = new GoogleSpreadsheet(
    '1MuWkH84pJhQFxe07CHxPBGQTiSz6FDYCuPAB_DMbgNY'
  );

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  });

  await doc.loadInfo();

  const sheet = doc.sheetsById['27972757'];
  await sheet.loadCells('A1:M16');

  const table = buildTable(sheet);

  console.table(table);
  console.log(table);
};

export default {
  getBalance,
};
