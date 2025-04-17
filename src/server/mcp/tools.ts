import { z } from 'zod';
import portfolioService from '../../modules/portfolio/portfolio.service';
import cryptoService, {
  portfolioTypes,
} from '../../modules/crypto/crypto.service';

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';

export const registerTools = (server: McpServer) => {
  server.tool(
    'portfolio-balance',
    'Get the total balance for all portfolios',
    async () => {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(await portfolioService.getBalance(), null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    'portfolio-shares',
    'Get distribution of shares in all portfolios',
    async () => {
      const shares = await portfolioService.getShares();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(shares, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    'crypto-balance',
    'Get the balance for a specific crypto portfolio type',
    {
      portfolioType: z.enum(portfolioTypes),
    },
    async ({ portfolioType }) => {
      const balance = await cryptoService.getBalance(portfolioType);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(balance, null, 2),
          },
        ],
      };
    }
  );
};
