import { GoogleSpreadsheet } from 'google-spreadsheet';
import { buildLogger } from '../libs/logger';

const log = buildLogger('GoogleSheets');

const toNumberIfPossible = value => {
  const num = +value.replace(/\./g, '').replace(',', '.');
  return isNaN(num) || value === '' ? value : num;
};

export default class GoogleSheets {
  async loadDocument(spreadsheetId) {
    this.doc = new GoogleSpreadsheet(spreadsheetId);

    await this.doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
    });

    await this.doc.loadInfo();
  }

  async loadSheet(sheetTitle) {
    log(`Loadind sheet ${sheetTitle}`);
    const sheet = this.doc.sheetsByTitle[sheetTitle];
    const rows = await sheet.getRows();

    return rows.map(row => {
      return row._sheet.headerValues.reduce((obj, key) => {
        obj[key] = toNumberIfPossible(row[key]);
        return obj;
      }, {});
    });
  }
}
