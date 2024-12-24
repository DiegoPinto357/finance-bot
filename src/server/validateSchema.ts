import { z } from 'zod';
import { buildLogger } from '../libs/logger';

import type { Request, Response, NextFunction } from 'express';
import type { ZodObject, ZodRawShape } from 'zod';

const log = buildLogger('HTTP Server - Schema Validation');

type RequestSchema = ZodObject<{
  params?: ZodObject<{}>;
  query?: ZodObject<{}>;
  body?: ZodObject<{}>;
}>;

const deepStrictWithDryRunSchema = (schema: RequestSchema) => {
  const extendeParams = schema.shape.params
    ? schema.shape.params.strict()
    : z.object({});

  const extendeQuery = schema.shape.query
    ? schema.shape.query
        .extend({
          dryRun: z.coerce.boolean().optional(),
        })
        .strict()
    : z.object({});

  const extendeBody = schema.shape.body
    ? schema.shape.body
        .extend({
          dryRun: z.boolean().optional(),
        })
        .strict()
    : z.object({});

  return schema.extend({
    params: extendeParams,
    query: extendeQuery,
    body: extendeBody,
  });
};

export default (schema: ZodRawShape = {}) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await deepStrictWithDryRunSchema(z.object(schema)).parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      const queryDryRun = req.query.dryRun;
      const bodyDryRun = req.body.dryRun;

      if (queryDryRun || bodyDryRun) {
        const { method, path, params, query, body } = req;
        const info = {
          method,
          path,
          params,
          query,
          body,
          description: 'Dry run mode',
        };
        log(info, { severity: 'warn' });
        return res.send(info);
      }

      return next();
    } catch (error) {
      log(error, { severity: 'error' });
      return res.status(400).json(error);
    }
  };
