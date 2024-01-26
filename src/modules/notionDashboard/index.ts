import notion from '../../providers/notion';
import { formatBalance } from '../crypto/uiUtils';

const logsPageId = 'c42c4c3ad74943ad860d7050f3f2a7e9';
const cryptoHodlTableContainerId = '1a8d0cbde9804b3e9972f4e7ea0d8e95';

const log = (message: string) => notion.appendParagraph(logsPageId, message);

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

const updateCryptoHodlTable = async (rows: CryptoHodlRow[]) =>
  await notion.updateChildTable(
    cryptoHodlTableContainerId,
    formatBalance('hodl', rows)
  );

export default {
  log,
  updateCryptoHodlTable,
};
