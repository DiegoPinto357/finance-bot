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

const getSheet = async sheetTitle => {
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

  return doc.sheetsByTitle[sheetTitle];
};

const getRows = async sheetTitle => {
  const sheet = await getSheet(sheetTitle);

  if (!sheet) {
    return null;
  }

  return await sheet.getRows();
};

const loadSheet = async sheetTitle => {
  log(`Loadindg sheet ${sheetTitle}`);
  const rows = await getRows(sheetTitle);

  if (!rows) {
    log(`Sheet ${sheetTitle} not found`, { severity: 'warn' });
    return [];
  }

  return rows.map(row => {
    return row._sheet.headerValues.reduce((obj, key, index, keys) => {
      const isMergedCell = key === '';
      if (isMergedCell) {
        key = keys[index - 1];
      }

      const value = toNumberIfPossible(row._rawData[index]);
      if (obj[key] != undefined) {
        obj[key] = [obj[key], value];
      } else {
        obj[key] = value;
      }
      return obj;
    }, {});
  });
};

const setSheet = async (sheetTitle, header, rows) => {
  log(`Setting sheet ${sheetTitle}`);
  const sheet = await getSheet(sheetTitle);
  await sheet.clearRows();
  await sheet.setHeaderRow(header);
  await sheet.addRows(rows);
};

const writeValue = async (sheetTitle, { index, target }) => {
  log(`Writing on sheet ${sheetTitle}`);
  const rows = await getRows(sheetTitle);

  const rowIndex = rows.findIndex(row => row[index.key] === index.value);
  rows[rowIndex][target.key] = target.value;
  await rows[rowIndex].save();
};

export default {
  resetDoc,
  loadSheet,
  setSheet,
  writeValue,
};
