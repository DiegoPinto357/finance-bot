import 'dotenv/config';
import { Client } from '@notionhq/client';

const pageId = 'c42c4c3ad74943ad860d7050f3f2a7e9'; // logs

(async () => {
  const notion = new Client({ auth: process.env.NOTION_TOKEN });
  await notion.blocks.children.append({
    block_id: pageId,
    children: [
      {
        paragraph: {
          rich_text: [
            {
              text: {
                content: `${new Date().toISOString()} - [Module name]: Message`,
              },
            },
          ],
        },
      },
    ],
  });
})();
