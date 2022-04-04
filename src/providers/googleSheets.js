import { GoogleSpreadsheet } from 'google-spreadsheet';

const spreadsheetId = '1dXeI-yZL4xbjzDBlKxnCyrFbDkJRGsEiq-wRLdNZlFo';

const toNumberIfPossible = value => {
  const num = +value.replace(/\./g, '').replace(',', '.');
  return isNaN(num) || value === '' ? value : num;
};

const loadSheet = async sheetTitle => {
  // TODO  move doc and common code to global scope
  const doc = new GoogleSpreadsheet(spreadsheetId);

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  });

  await doc.loadInfo();
  const sheet = doc.sheetsByTitle[sheetTitle];
  const rows = await sheet.getRows();

  return rows.map(row => {
    return row._sheet.headerValues.reduce((obj, key) => {
      obj[key] = toNumberIfPossible(row[key]);
      return obj;
    }, {});
  });
};

export default {
  loadSheet,
};
