import notion from '../../providers/notion';
import { formatBalance } from '../crypto/uiUtils';

const logsPageId = 'c42c4c3ad74943ad860d7050f3f2a7e9';
const cryptoHodlTableId = '186a8027e7ea48fb80442a6146177615';

const log = (message: string) => notion.appendParagraph(logsPageId, message);

// TODO convert HODL module to TS and use proper types
type CryptoHodlRow = {
  asset: string;
  spot: number;
  earn: number;
  total: number;
  portfolioScore: number;
  priceBRL: number;
  positionBRL: number;
  positionTarget: number;
  position: number;
  positionDiff: number;
  diffBRL: number;
  diffTokens: number;
};

const updateCryptoHodlTable = (rows: CryptoHodlRow[]) =>
  notion.appendRowsToTable(cryptoHodlTableId, formatBalance('hodl', rows));

export default {
  log,
  updateCryptoHodlTable,
};
