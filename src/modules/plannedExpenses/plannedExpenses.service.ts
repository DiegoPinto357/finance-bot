import { z } from 'zod';
import database from '../../providers/database';
import { portfolioSchema, monthSchema, MONTH } from '../../schemas';

import type { Portfolio, Month } from '../../schemas';

type PlannedExpense = {
  _id: string;
  portfolio: Portfolio;
  totalValue: number;
  installments: number;
  startMonth: Month;
  startYear: number;
  description: string;
};

type InstallmentDetail = {
  installmentNumber: number;
  value: number;
  totalInstallments: number;
  description: string;
  plannedExpenseId: string;
};

type PortfolioInstallments = {
  portfolio: Portfolio;
  installments: InstallmentDetail[];
  totalValue: number;
};

type MonthlyInstallmentsResult = PortfolioInstallments[];

export const getPlannedExpensesSchema = z.object({
  portfolio: portfolioSchema.optional(),
});

export const getMonthlyInstallmentsSchema = z.object({
  year: z.coerce.number().int().min(1900).max(2100),
  month: monthSchema,
});

export const addPlannedExpenseSchema = z.object({
  portfolio: portfolioSchema,
  totalValue: z.number().positive(),
  installments: z.number().int().positive(),
  startMonth: monthSchema,
  startYear: z.number().int().min(1900).max(2100),
  description: z.string(),
});

const getPlannedExpenses = async (
  query: z.infer<typeof getPlannedExpensesSchema>
) => {
  const filter = query.portfolio ? { portfolio: query.portfolio } : {};
  return await database.find<PlannedExpense[]>(
    'expenses',
    'planned',
    filter,
    {}
  );
};

const getMonthlyInstallments = async (
  query: z.infer<typeof getMonthlyInstallmentsSchema>
): Promise<MonthlyInstallmentsResult> => {
  const { year, month } = query;
  const targetMonthIndex = MONTH.indexOf(month);
  const currentYear = new Date().getFullYear();

  // Get all expenses and filter in the application
  const expenses = await getPlannedExpenses({});
  const portfolioMap = new Map<Portfolio, InstallmentDetail[]>();

  // Create all installments and filter to target month/year
  const allInstallments = expenses.flatMap(expense =>
    Array.from({ length: expense.installments }, (_, i) => {
      const startMonthIndex = MONTH.indexOf(expense.startMonth);
      const monthIndex = (startMonthIndex + i) % 12;
      const installmentYear =
        expense.startYear + Math.floor((startMonthIndex + i) / 12);

      return {
        expense,
        installmentIndex: i,
        monthIndex,
        installmentYear,
        installmentDetail: {
          installmentNumber: i + 1,
          value: expense.totalValue / expense.installments,
          totalInstallments: expense.installments,
          description: expense.description,
          plannedExpenseId: expense._id || 'unknown',
        },
      };
    }).filter(
      ({ installmentYear, monthIndex }) =>
        installmentYear === year && monthIndex === targetMonthIndex
    )
  );

  // Group by portfolio
  allInstallments.forEach(({ expense, installmentDetail }) => {
    if (!portfolioMap.has(expense.portfolio)) {
      portfolioMap.set(expense.portfolio, []);
    }
    portfolioMap.get(expense.portfolio)!.push(installmentDetail);
  });

  // Convert map to result array and calculate totals
  return Array.from(portfolioMap.entries())
    .map(([portfolio, installments]) => ({
      portfolio,
      installments,
      totalValue: installments.reduce(
        (sum, installment) => sum + installment.value,
        0
      ),
    }))
    .sort((a, b) => a.portfolio.localeCompare(b.portfolio));
};

const addPlannedExpense = async (
  expense: z.infer<typeof addPlannedExpenseSchema>
) => {
  await database.insertOne<PlannedExpense>('expenses', 'planned', expense);
};

export default {
  getPlannedExpenses,
  getMonthlyInstallments,
  addPlannedExpense,
};
