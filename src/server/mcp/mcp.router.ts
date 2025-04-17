import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { registerTools } from './tools';
import { buildLogger } from '../../libs/logger';

const log = buildLogger('MCP Server');

const router = express.Router();

const mcpServer = new McpServer({
  name: 'Finance Bot',
  version: '1.0.0',
});

registerTools(mcpServer);

const transports: { [sessionId: string]: SSEServerTransport } = {};

router.get('/sse', async (_, res) => {
  log('SSE connection established');
  const transport = new SSEServerTransport('/messages', res);
  transports[transport.sessionId] = transport;
  log(`created sessionId: ${transport.sessionId}`);
  res.on('close', () => {
    log('SSE connection closed');
    delete transports[transport.sessionId];
  });
  await mcpServer.connect(transport);
});

router.post<{ Querystring: { sessionId: string } }>(
  '/messages',
  async (req, res) => {
    log('SSE message received');
    const sessionId = req.query.sessionId as string;
    if (!sessionId) {
      res.status(400).send('Invalid sessionId');
      return;
    }
    const transport = transports[sessionId];
    log(`message sessionId: ${sessionId} `);
    if (transport) {
      await transport.handlePostMessage(req, res, req.body);
    } else {
      res.status(400).send('No transport found for sessionId');
    }
  }
);

export default router;
