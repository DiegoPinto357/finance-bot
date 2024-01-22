import { Client } from '@notionhq/client';
import { buildLogger } from '../libs/logger';

const log = buildLogger('Notion');

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const appendParagraph = (blockId: string, text: string) => {
  log(`Appending paragraph to block ${blockId}`);
  return notion.blocks.children.append({
    block_id: blockId,
    children: [
      {
        paragraph: {
          rich_text: [
            {
              text: {
                content: text,
              },
            },
          ],
        },
      },
    ],
  });
};

const mapTableRowCell = (cell: unknown) => {
  const content = `${cell}`;
  return [
    {
      type: 'text' as const,
      text: {
        content,
        // link: null, // TODO add link to Binance asset
      },
      // annotations: {
      //   // TODO make annotation optional via params
      //   bold: false,
      //   italic: false,
      //   strikethrough: false,
      //   underline: false,
      //   code: false,
      //   color: 'default',
      // },
    },
  ];
};

const mapTableRow = (row: object) => {
  const cells = Object.values(row).map(mapTableRowCell);
  return {
    type: 'table_row' as const,
    table_row: {
      cells,
    },
  };
};

const clearTableRows = async (tableId: string) => {
  const { results: currentRows } = await notion.blocks.children.list({
    block_id: tableId,
  });
  const currentRowsId = currentRows.map(({ id }) => id).slice(1);
  for (const id of currentRowsId) {
    log(`Deleting row ${id} from table ${tableId}`);
    await notion.blocks.delete({ block_id: id });
  }
};

const appendRowsToTable = async (tableId: string, rows: object[]) => {
  await clearTableRows(tableId);
  const mappedRows = rows.map(mapTableRow);

  log(`Appending rows to table ${tableId}`);
  await notion.blocks.children.append({
    block_id: tableId,
    children: mappedRows,
  });
};

export default {
  appendParagraph,
  appendRowsToTable,
};
