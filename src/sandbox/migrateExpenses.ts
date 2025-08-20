import 'dotenv/config';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { promises as fs } from 'fs';
import path from 'path';
import database from '../providers/database';
import { MONTH, Month, Portfolio } from '../schemas';

// Define the PlannedExpense type based on plannedExpenses.service.ts
type PlannedExpense = {
  portfolio: string; // Placeholder, needs to be determined
  totalValue: number;
  installments: number;
  startMonth: Month;
  startYear: number;
  description: string;
};

const descriptionToPortfolioMap: Record<string, Portfolio> = {
  'AirBnB SP': 'viagem',
  'Anestesia FIV': 'suricat',
  'Análise genética FIV': 'suricat',
  'Ar condicionado': 'reformaCasa',
  Atosiban: 'suricat',
  'Biópsia FIV': 'suricat',
  Clexane: 'suricat',
  'Consulta Dr. Arnaldo': 'suricat',
  'Consulta Mater Prime': 'suricat',
  'Consulta Nutri': 'suricat',
  'Consulta nutri': 'suricat',
  EmbryoScope: 'suricat',
  'Exame FIV': 'suricat',
  'Exame KIR': 'suricat',
  'Exame endométrio': 'suricat',
  'Exames FIV': 'suricat',
  'FIV Huntington': 'suricat',
  'FIV IPGO': 'suricat',
  Fogão: 'reformaCasa',
  IPTU: 'impostos',
  'Lipofundin FIV': 'suricat',
  'Manutenção carro': 'manutencaoCarro',
  'Mater Lab': 'suricat',
  'Moldura quadros': 'reformaCasa',
  Ovidrel: 'suricat',
  'Remédios FIV': 'suricat',
  'Revisão carro': 'manutencaoCarro',
  'Seguro carro': 'seguroCarro',
  'Suplemento FIV': 'suricat',
  'Suplementos FIV': 'suricat',
  TE: 'suricat',
  Viagens: 'viagem',
};

const parseExpenseLine = (
  line: string,
  fileMonth: string,
  fileYear: number
): PlannedExpense | null => {
  const regex = /^(.*?)(?: \((\d+)\/(\d+)\))?\s*[:]?\s*R\$\s*([\d.,]+)\s*$/;
  const match = line.match(regex);

  if (!match) {
    return null;
  }

  let description = match[1].trim();
  const currentInstallment = match[2] ? parseInt(match[2], 10) : 1;
  const totalInstallments = match[3] ? parseInt(match[3], 10) : 1;
  const valueStr = match[4].replace('.', '').replace(',', '.');
  const value = parseFloat(valueStr);

  if (isNaN(value)) {
    return null;
  }

  // Remove the (X/Y) part from the description if it exists
  description = description.replace(/\s*\(\d+\/\d+\)$/, '').trim();
  // Remove trailing colon if it exists
  description = description.replace(/:\s*$/, '').trim();

  const totalValue = value * totalInstallments;

  // Calculate startMonth
  const fileMonthIndex = MONTH.indexOf(fileMonth.toLowerCase() as Month);
  if (fileMonthIndex === -1) {
    console.warn(`Invalid month in filename: ${fileMonth}`);
    return null;
  }

  let startMonthIndex = fileMonthIndex - (currentInstallment - 1);
  let startYear = fileYear;

  while (startMonthIndex < 0) {
    startMonthIndex += 12;
    startYear -= 1;
  }

  const startMonth = MONTH[startMonthIndex] as Month;

  // TODO: How to determine portfolio? For now, using a placeholder.
  const portfolio = descriptionToPortfolioMap[description] || 'misc';

  return {
    portfolio,
    totalValue,
    installments: totalInstallments,
    startMonth,
    startYear,
    description,
  };
};

const run = async () => {
  const argv = yargs(hideBin(process.argv))
    .option('dryrun', {
      type: 'boolean',
      default: false,
      description: 'If true, only prints the data without pushing to DB',
    })
    .option('listDescriptions', {
      type: 'boolean',
      default: false,
      description: 'If true, lists all unique expense descriptions',
    })
    .parseSync();

  const expensesDirPath = path.resolve(__dirname, './data/expenses');
  let files: string[] = [];
  try {
    files = await fs.readdir(expensesDirPath);
  } catch (error) {
    console.error(`Error reading expenses directory: ${error}`);
    return;
  }

  const plannedExpenses: PlannedExpense[] = [];
  const uniqueDescriptions = new Set<string>();
  const processedExpenses = new Map<string, PlannedExpense>();

  for (const file of files) {
    if (file.endsWith('.txt')) {
      const filePath = path.join(expensesDirPath, file);
      const fileNameParts = file.replace('.txt', '').split('-');
      if (fileNameParts.length !== 2) {
        console.warn(`Skipping malformed filename: ${file}`);
        continue;
      }
      const fileYear = parseInt(fileNameParts[0], 10);
      const fileMonth = MONTH[parseInt(fileNameParts[1], 10) - 1] as Month; // Convert month number to name

      if (isNaN(fileYear) || !fileMonth) {
        console.warn(`Skipping malformed filename (year/month): ${file}`);
        continue;
      }

      let content = '';
      try {
        content = await fs.readFile(filePath, 'utf-8');
      } catch (error) {
        console.error(`Error reading file ${filePath}: ${error}`);
        continue;
      }

      const lines = content.split('\n').filter(line => line.trim() !== '');
      for (const line of lines) {
        const expense = parseExpenseLine(line, fileMonth, fileYear);
        if (expense) {
          const expenseKey = `${expense.description}-${expense.totalValue}-${expense.installments}-${expense.startMonth}-${expense.startYear}`;
          if (!processedExpenses.has(expenseKey)) {
            processedExpenses.set(expenseKey, expense);
            plannedExpenses.push(expense); // Only push if it's the first time we see this expense
          }
          uniqueDescriptions.add(expense.description);
        } else {
          console.warn(`Could not parse line: "${line}" in file: ${file}`);
        }
      }
    }
  }

  if (argv.listDescriptions) {
    console.log('Unique Descriptions:');
    [...uniqueDescriptions].sort().forEach(desc => console.log(desc));
  } else if (argv.dryrun) {
    console.log('Dry run: Parsed expenses:');
    console.dir(plannedExpenses, { depth: null });
  } else {
    console.log('Connecting to database...');
    try {
      await database.connect();
      console.log('Inserting expenses into database...');
      for (const expense of plannedExpenses) {
        await database.insertOne('expenses', 'planned', expense);
      }
      console.log(`Successfully inserted ${plannedExpenses.length} expenses.`);
    } catch (error) {
      console.error(`Error inserting data into database: ${error}`);
    } finally {
      database.close();
    }
  }
};

run();
