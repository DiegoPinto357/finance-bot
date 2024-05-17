import express from 'express';

import type { Request, Response } from 'express';

const router = express.Router();

router.get('/api/system/version', async (_req: Request, res: Response) =>
  res.json({ version: process.env.npm_package_version })
);

export default router;
