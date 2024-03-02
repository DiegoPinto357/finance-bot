import { buildLogger } from '../libs/logger';
import type { Request, Response, NextFunction } from 'express';

const log = buildLogger('HTTP Server - DryRun Middleware');

type DryRunParam = {
  dryRun: boolean;
};

export default (
  req: Request<{}, {}, DryRunParam, DryRunParam>,
  res: Response,
  next: NextFunction
) => {
  const queryDryRun = req.query.dryRun;
  const bodyDryRun = req.body.dryRun;

  if (queryDryRun || bodyDryRun) {
    const { path, params, query, body } = req;
    const info = { path, params, query, body };
    log(JSON.stringify(info));
    return res.send({ ...info, description: 'Dry run mode' });
  }

  return next();
};
