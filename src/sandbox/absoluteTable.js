import 'dotenv/config';
import { GoogleSpreadsheet } from 'google-spreadsheet';

const spreadsheetId = '1dXeI-yZL4xbjzDBlKxnCyrFbDkJRGsEiq-wRLdNZlFo';
const doc = new GoogleSpreadsheet(spreadsheetId);

(async () => {
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  });

  await doc.loadInfo();

  const sheet = doc.sheetsByTitle['portfolio-absolute'];
  await sheet.clearRows();

  // const rows = await sheet.getRows();
  // console.log(rows);
})();
