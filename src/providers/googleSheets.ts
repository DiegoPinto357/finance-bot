import {
  GoogleSpreadsheet,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { buildLogger } from '../libs/logger';

interface RowWithRawData {
  _rawData: string[];
}

const log = buildLogger('GoogleSheets');

let doc: GoogleSpreadsheet;

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

let docLoadedStatus = false;
const spreadsheetId = '1dXeI-yZL4xbjzDBlKxnCyrFbDkJRGsEiq-wRLdNZlFo';

const resetDoc = () => {
  doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);
  docLoadedStatus = false;
};

resetDoc();

const toNumberIfPossible = (value: string | number | undefined) => {
  if (
    typeof value === 'number' ||
    value === undefined ||
    value.slice(0, 2) === '0x'
  )
    return value;
  const num = +value.replace(/\./g, '').replace(',', '.');
  return isNaN(num) || value === '' ? value : num;
};

const getSheet = async (sheetTitle: string) => {
  if (!docLoadedStatus) {
    await doc.loadInfo();
    docLoadedStatus = true;
  }

  return doc.sheetsByTitle[sheetTitle];
};

const getRows = async (sheetTitle: string) => {
  const sheet = await getSheet(sheetTitle);

  if (!sheet) {
    return null;
  }

  return await sheet.getRows();
};

const loadSheet = async <T>(sheetTitle: string) => {
  log(`Loadindg sheet ${sheetTitle}`);
  const rows = await getRows(sheetTitle);

  if (!rows) {
    log(`Sheet ${sheetTitle} not found`, { severity: 'warn' });
    return [] as T;
  }

  return rows.map(row => {
    return row._worksheet.headerValues.reduce((obj, key, index, keys) => {
      const isMergedCell = key === '';
      if (isMergedCell) {
        key = keys[index - 1];
      }

      const rawValue = (row as unknown as RowWithRawData)._rawData[index];
      const value = toNumberIfPossible(rawValue);

      if (value !== undefined) {
        if (obj[key] != undefined) {
          obj[key] = [obj[key], value];
        } else {
          obj[key] = value;
        }
      }

      return obj;
    }, {} as Record<string, unknown>);
  }) as T;
};

type Rows = Parameters<GoogleSpreadsheetWorksheet['addRows']>[0];

const setSheet = async (sheetTitle: string, header: string[], rows: Rows) => {
  log(`Setting sheet ${sheetTitle}`);
  const sheet = await getSheet(sheetTitle);
  await sheet.clearRows();
  await sheet.setHeaderRow(header);
  await sheet.addRows(rows);
};

export default {
  resetDoc,
  loadSheet,
  setSheet,
};
