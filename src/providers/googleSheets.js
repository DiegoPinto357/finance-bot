import { GoogleSpreadsheet } from 'google-spreadsheet';
import { buildLogger } from '../libs/logger';

const log = buildLogger('GoogleSheets');

let doc;

const docStatus = { authenticated: false, loaded: false };
const spreadsheetId = '1dXeI-yZL4xbjzDBlKxnCyrFbDkJRGsEiq-wRLdNZlFo';

const resetDoc = () => {
  doc = new GoogleSpreadsheet(spreadsheetId);
  docStatus.authenticated = false;
  docStatus.loaded = false;
};

resetDoc();

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
  const { authenticated, loaded } = docStatus;

  if (!authenticated) {
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
    });
    docStatus.authenticated = true;
  }

  if (!loaded) {
    await doc.loadInfo();
    docStatus.loaded = true;
  }

  log(`Loadind sheet ${sheetTitle}`);
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
  log(`Writing on sheet ${sheetTitle}`);
  await rows[rowIndex].save();
};

export default {
  resetDoc,
  loadSheet,
  writeValue,
};
