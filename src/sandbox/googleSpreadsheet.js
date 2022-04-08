import 'dotenv/config';
import { GoogleSpreadsheet } from 'google-spreadsheet';

(async () => {
  const doc = new GoogleSpreadsheet(
    // '1MuWkH84pJhQFxe07CHxPBGQTiSz6FDYCuPAB_DMbgNY'
    '1NWnX0_c7K7aq3lM7DmWO3WOoh9RmPVRxpQF7vuHJRGc'
  );

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  });

  await doc.loadInfo();
  const sheet = doc.sheetsByTitle['previdencia'];
  const rows = await sheet.getRows();
  console.log(
    rows.map(row => {
      return row._sheet.headerValues.reduce((obj, key) => {
        obj[key] = row[key];
        return obj;
      }, {});
    })
  );
})();
