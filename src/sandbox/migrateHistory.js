const fs = require('fs');
const csv = require('csv-parser');
const { MongoClient } = require('mongodb');

// Function to convert currency formatted string to float
function currencyToFloat(currencyStr) {
  if (currencyStr && typeof currencyStr === 'string') {
    let cleanedStr = currencyStr.replace('R$', '').trim();
    cleanedStr = cleanedStr.replace(/\./g, '');
    cleanedStr = cleanedStr.replace(',', '.');
    return parseFloat(cleanedStr) || 0.0;
  }
  return 0.0;
}

// MongoDB connection
const dbPassword = '';
const uri = `mongodb+srv://finance-bot-admin:${dbPassword}@finance-bot.24mvojo.mongodb.net`;
console.log(uri);
const dbName = 'portfolio';
const collectionName = 'history';

// Create a new MongoClient
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function insertData() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Parsing and transforming CSV data
    const dataByDate = {}; // To accumulate data by date

    fs.createReadStream(
      '/Users/diego.dossantos/Projects/finance-bot/src/sandbox/data/portfolioHistory.csv'
    )
      .pipe(csv({ separator: ',' }))
      .on('data', row => {
        const date = new Date(row.data.split('/').reverse().join('-'))
          .toISOString()
          .split('T')[0];

        if (!dataByDate[date]) {
          dataByDate[date] = { date, portfolios: {} };
        }

        for (const [key, value] of Object.entries(row)) {
          if (
            key !== 'data' &&
            key !== 'total' &&
            key !== 'delta' &&
            key !== 'delta12Meses'
          ) {
            dataByDate[date].portfolios[key.trim()] = currencyToFloat(value);
          }
        }
      })
      .on('end', async () => {
        // Insert accumulated data grouped by date
        const documents = Object.values(dataByDate);
        // console.log(dataByDate);
        // console.log('---------------');
        // console.log(documents);
        // if (documents.length > 0) {
        //   await collection.insertMany(documents);
        // }

        console.log('Data migration complete.');
        client.close();
      });
  } catch (err) {
    console.error(err);
  }
}

// Run the function to insert data
insertData();
