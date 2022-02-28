import { GoogleSpreadsheet } from 'google-spreadsheet';

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

  const table = new Array(16)
    .fill()
    .map((_row, rowIndex) =>
      new Array(13)
        .fill()
        .map((_cell, colIndex) => sheet.getCell(rowIndex, colIndex).value)
    );

  console.table(table);
};

export default {
  getBalance,
};
