import database from '../../providers/database';
import plannedExpensesService from './plannedExpenses.service';

type MockDatabase = typeof database & { resetMockValues: () => void };

jest.mock('../../providers/database');

describe('plannedExpensesService', () => {
  beforeEach(() => {
    (database as MockDatabase).resetMockValues();
    jest.clearAllMocks();
  });

  describe('getPlannedExpenses', () => {
    it('returns all expenses when no filters are provided', async () => {
      const result = await plannedExpensesService.getPlannedExpenses({});
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('filters by portfolio', async () => {
      const result = await plannedExpensesService.getPlannedExpenses({
        portfolio: 'viagem',
      });
      expect(Array.isArray(result)).toBe(true);
      result.forEach(expense => {
        expect(expense.portfolio).toBe('viagem');
      });
    });
  });

  describe('getMonthlyInstallments', () => {
    it('returns monthly installments grouped by portfolio for a specific year and month', async () => {
      const result = await plannedExpensesService.getMonthlyInstallments({
        year: 2025,
        month: 'mar',
      });

      expect(result).toHaveLength(2);

      const financiamentoGroup = result.find(
        group => group.portfolio === 'financiamento'
      );
      expect(financiamentoGroup).toBeDefined();
      expect(financiamentoGroup!.portfolio).toBe('financiamento');
      expect(financiamentoGroup!.totalValue).toBeCloseTo(416.67, 2); // 10000 / 24
      expect(financiamentoGroup!.installments).toHaveLength(1);

      const financiamentoInstallment = financiamentoGroup!.installments[0];
      expect(financiamentoInstallment.installmentNumber).toBe(1);
      expect(financiamentoInstallment.value).toBeCloseTo(416.67, 2); // 10000 / 24
      expect(financiamentoInstallment.totalInstallments).toBe(24);
      expect(financiamentoInstallment.description).toBe('Car financing');
      expect(financiamentoInstallment.plannedExpenseId).toBe('2');

      const viagemGroup = result.find(group => group.portfolio === 'viagem');
      expect(viagemGroup).toBeDefined();
      expect(viagemGroup!.portfolio).toBe('viagem');
      expect(viagemGroup!.totalValue).toBeCloseTo(416.67, 2); // 5000 / 12

      const viagemInstallment = viagemGroup!.installments[0];
      expect(viagemInstallment.installmentNumber).toBe(3);
      expect(viagemInstallment.value).toBeCloseTo(416.67, 2); // 5000 / 12
      expect(viagemInstallment.totalInstallments).toBe(12);
      expect(viagemInstallment.description).toBe('Trip to Europe');
      expect(viagemInstallment.plannedExpenseId).toBe('1');
    });

    it('calculates correct portfolio totals', async () => {
      const result = await plannedExpensesService.getMonthlyInstallments({
        year: 2025,
        month: 'mar',
      });

      expect(result).toHaveLength(2);

      result.forEach(portfolioGroup => {
        const calculatedTotal = portfolioGroup.installments.reduce(
          (sum, installment) => sum + installment.value,
          0
        );
        expect(portfolioGroup.totalValue).toBeCloseTo(calculatedTotal, 2);
      });
    });

    it('returns empty array when no installments exist for the specified month', async () => {
      const result = await plannedExpensesService.getMonthlyInstallments({
        year: 2030,
        month: 'dec',
      });

      expect(result).toEqual([]);
    });

    it('groups installments correctly by portfolio', async () => {
      const result = await plannedExpensesService.getMonthlyInstallments({
        year: 2025,
        month: 'mar',
      });

      expect(result).toHaveLength(2);

      const portfolioNames = result.map(group => group.portfolio);
      const uniquePortfolios = new Set(portfolioNames);
      expect(portfolioNames.length).toBe(uniquePortfolios.size);

      expect(portfolioNames).toContain('viagem');
      expect(portfolioNames).toContain('financiamento');

      expect(portfolioNames).toEqual(['financiamento', 'viagem']);
    });

    it('handles different installment numbers correctly', async () => {
      const resultFeb = await plannedExpensesService.getMonthlyInstallments({
        year: 2025,
        month: 'feb',
      });

      expect(resultFeb).toHaveLength(1);

      const viagemGroup = resultFeb[0];
      expect(viagemGroup.portfolio).toBe('viagem');
      expect(viagemGroup.installments).toHaveLength(1);
      expect(viagemGroup.installments[0].installmentNumber).toBe(2);
      expect(viagemGroup.installments[0].value).toBeCloseTo(416.67, 2);
      expect(viagemGroup.installments[0].plannedExpenseId).toBe('1');
    });
  });

  describe('addPlannedExpense', () => {
    it('adds a new expense', async () => {
      const newExpense = {
        portfolio: 'previdencia',
        totalValue: 3000,
        installments: 6,
        startMonth: 'jun',
        description: 'Investment Plan',
      } as const;

      await plannedExpensesService.addPlannedExpense(newExpense);

      expect(database.insertOne).toHaveBeenCalledTimes(1);
      expect(database.insertOne).toHaveBeenCalledWith(
        'expenses',
        'planned',
        newExpense
      );
    });

    it('accepts any valid expense data', async () => {
      const validExpense = {
        portfolio: 'financiamento',
        totalValue: 15000,
        installments: 36,
        startMonth: 'jan',
        description: 'House financing',
      } as const;

      await plannedExpensesService.addPlannedExpense(validExpense);

      expect(database.insertOne).toHaveBeenCalledTimes(1);
      expect(database.insertOne).toHaveBeenCalledWith(
        'expenses',
        'planned',
        validExpense
      );
    });
  });
});
