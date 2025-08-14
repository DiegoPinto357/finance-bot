import express from 'express';
import { z } from 'zod';
import validateSchema from '../../server/validateSchema';
import plannedExpensesService, {
  addPlannedExpenseSchema,
  getMonthlyInstallmentsSchema,
  getPlannedExpensesSchema,
} from './plannedExpenses.service';

import type { Request, Response } from 'express';

const router = express.Router();

router.get(
  '/api/plannedExpenses',
  validateSchema({ query: getPlannedExpensesSchema }),
  async (
    req: Request<{}, {}, {}, z.infer<typeof getPlannedExpensesSchema>>,
    res: Response
  ) => res.json(await plannedExpensesService.getPlannedExpenses(req.query))
);

router.get(
  '/api/plannedExpenses/monthly',
  validateSchema({ query: getMonthlyInstallmentsSchema }),
  async (req: Request, res: Response) => {
    // Parse and transform the query parameters (z.coerce will handle string->number conversion)
    const validatedQuery = getMonthlyInstallmentsSchema.parse(req.query);
    res.json(
      await plannedExpensesService.getMonthlyInstallments(validatedQuery)
    );
  }
);

router.post(
  '/api/plannedExpenses',
  validateSchema({ body: addPlannedExpenseSchema }),
  async (
    req: Request<{}, z.infer<typeof addPlannedExpenseSchema>>,
    res: Response
  ) => res.json(await plannedExpensesService.addPlannedExpense(req.body))
);

export default router;
