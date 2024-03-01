import { z } from 'zod';

import type { Request, Response, NextFunction } from 'express';
import type { AnyZodObject, ZodObject } from 'zod';

type RequestSchema = ZodObject<{
  params?: ZodObject<{}>;
  query?: ZodObject<{}>;
  body?: ZodObject<{}>;
}>;

const deppStrictWithDryRunSchema = (schema: RequestSchema) => {
  const extendeParams = schema.shape.query
    ? schema.shape.query.strict()
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

export default (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await deppStrictWithDryRunSchema(schema).parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      return res.status(400).json(error);
    }
  };
