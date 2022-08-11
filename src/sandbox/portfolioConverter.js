import fs from 'fs';

const toNumber = value =>
  value !== ''
    ? parseFloat(value.replace('R$', '').replace('.', '').replace(',', '.'))
    : 0;

const sheetData = fs.readFileSync('./src/sandbox/portfolio.sheet', 'utf-8');
const rows = sheetData.split('\n').map(row => row.split('\t'));

const assets = rows.shift();
assets.shift();

const totals = rows.pop();
totals.shift();

const data = assets.map((asset, index) => {
  const cols = rows.map(
    row => toNumber(row[index + 1]) / toNumber(totals[index])
  );

  const shareSum = cols.reduce((acc, current) => acc + current, 0);
  if (shareSum < 0.99999 || shareSum > 1.00001)
    throw new Error(`Sum of shares is not 1: current value ${shareSum}`);

  const shares = cols.map((col, rowIndex) => ({
    portfolio: rows[rowIndex][0],
    value: col,
  }));
  const [assetClass, assetName] = asset.split('.');
  return { assetClass, assetName, shares };
});

console.dir(data, { depth: null });
