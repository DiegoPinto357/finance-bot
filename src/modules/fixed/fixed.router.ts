import express from 'express';
import fixedService from './fixed.service';

import type { Request, Response } from 'express';
import type { FixedAsset } from '../../types';

const router = express.Router();

router.get(
  '/api/fixed/balance',
  async (
    req: Request<
      {},
      {},
      {},
      { assetName: FixedAsset | FixedAsset[] | undefined }
    >,
    res: Response
  ) => {
    res.json(await fixedService.getBalance(req.query.assetName));
  }
);

router.post('/api/fixed/asset-value', async (req: Request, res: Response) => {
  console.log('/api/fixed/asset-value');
  console.log(req.body);
  res.send();
});

export default router;
