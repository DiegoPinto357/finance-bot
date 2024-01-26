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
      },
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

const updateChildTable = async (tableContainerId: string, rows: object[]) => {
  log(`Updating table inside ${tableContainerId} container`);
  const children = await notion.blocks.children.list({
    block_id: tableContainerId,
  });
  const table = children.results.find(
    child => 'type' in child && child.type === 'table'
  );

  if (table) {
    const { id } = table;
    await notion.blocks.delete({ block_id: id });
  }

  const header = [
    'asset',
    'spot',
    'earn',
    'total',
    'portfolioScore',
    'priceBRL',
    'positionBRL',
    'positionTarget',
    'position',
    'positionDiff',
    'diffBRL',
    'diffTokens',
  ];

  await notion.blocks.children.append({
    block_id: tableContainerId,
    children: [
      {
        type: 'table',
        table: {
          table_width: 12,
          has_column_header: true,
          has_row_header: false,
          children: [header, ...rows].map(mapTableRow),
        },
      },
    ],
  });
};

export default {
  appendParagraph,
  updateChildTable,
};
