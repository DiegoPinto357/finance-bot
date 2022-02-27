require('dotenv').config();
const { GoogleSpreadsheet } = require('google-spreadsheet');

(async () => {
  const doc = new GoogleSpreadsheet(
    '1MuWkH84pJhQFxe07CHxPBGQTiSz6FDYCuPAB_DMbgNY'
  );

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  });

  await doc.loadInfo();
  console.log(doc.title);
})();
