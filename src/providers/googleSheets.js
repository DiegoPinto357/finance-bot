import { GoogleSpreadsheet } from 'google-spreadsheet';
import { buildLogger } from '../libs/logger';

const log = buildLogger('GoogleSheets');

const spreadsheetId = '1dXeI-yZL4xbjzDBlKxnCyrFbDkJRGsEiq-wRLdNZlFo';
const doc = new GoogleSpreadsheet(spreadsheetId);

const toNumberIfPossible = value => {
  if (
    typeof value === 'number' ||
    value === undefined ||
    value.slice(0, 2) === '0x'
  )
    return value;
  const num = +value.replace(/\./g, '').replace(',', '.');
  return isNaN(num) || value === '' ? value : num;
};

const loadDoc = async sheetTitle => {
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  });

  log(`Loadind sheet ${sheetTitle}`);
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle[sheetTitle];
  return await sheet.getRows();
};

const loadSheet = async sheetTitle => {
  const rows = await loadDoc(sheetTitle);

  return rows.map(row => {
    return row._sheet.headerValues.reduce((obj, key) => {
      obj[key] = toNumberIfPossible(row[key]);
      return obj;
    }, {});
  });
};

const writeValue = async (sheetTitle, { index, target }) => {
  const rows = await loadDoc(sheetTitle);
  const rowIndex = rows.findIndex(row => row[index.key] === index.value);
  rows[rowIndex][target.key] = target.value;
  await rows[rowIndex].save();
};

export default {
  loadSheet,
  writeValue,
};
