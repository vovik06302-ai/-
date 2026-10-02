import { TransactionEntity, EmployeeEntity, SalaryPayoutEntity, AppTheme, TransactionType, DebtorSummaryGroup } from './types';

const STORAGE_KEYS = {
  TRANSACTIONS: 'autofinance_transactions',
  EMPLOYEES: 'autofinance_employees',
  SALARY_PAYOUTS: 'autofinance_salary_payouts',
  THEME: 'autofinance_theme'
};

const INITIAL_TRANSACTIONS: TransactionEntity[] = [
  {
    id: 101,
    type: 'PROFIT',
    amount: 15000,
    note: 'Замена ГРМ и масляного сервиса',
    clientInfo: 'Toyota Camry A777AA77',
    date: Date.now() - 3600000 * 5
  },
  {
    id: 102,
    type: 'EXPENSE',
    amount: 4500,
    note: 'Покупка моторного масла и фильтров',
    clientInfo: 'Запчасти',
    date: Date.now() - 3600000 * 24
  },
  {
    id: 103,
    type: 'DEBTOR',
    amount: 8000,
    note: 'Диагностика подвески и замена рычагов',
    clientInfo: 'Сергей Kia Rio B123BB',
    date: Date.now() - 3600000 * 48
  }
];

const INITIAL_EMPLOYEES: EmployeeEntity[] = [
  { id: 1, name: 'Алексей (Механик)', salary: 70000 },
  { id: 2, name: 'Михаил (Электрик)', salary: 85000 }
];

export function loadTransactions(): TransactionEntity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      saveTransactions(INITIAL_TRANSACTIONS);
      return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load transactions', e);
    return INITIAL_TRANSACTIONS;
  }
}

export function saveTransactions(items: TransactionEntity[]): void {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(items));
}

export function loadEmployees(): EmployeeEntity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (!raw) {
      saveEmployees(INITIAL_EMPLOYEES);
      return INITIAL_EMPLOYEES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_EMPLOYEES;
  }
}

export function saveEmployees(items: EmployeeEntity[]): void {
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(items));
}

export function loadSalaryPayouts(): SalaryPayoutEntity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SALARY_PAYOUTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveSalaryPayouts(items: SalaryPayoutEntity[]): void {
  localStorage.setItem(STORAGE_KEYS.SALARY_PAYOUTS, JSON.stringify(items));
}

export function loadTheme(): AppTheme {
  try {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME) as AppTheme;
    if (theme && ['BLUE', 'GREEN', 'PURPLE', 'ORANGE', 'RED'].includes(theme)) {
      return theme;
    }
  } catch (e) {}
  return 'BLUE';
}

export function saveTheme(theme: AppTheme): void {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
}

export function groupDebtors(transactions: TransactionEntity[]): DebtorSummaryGroup[] {
  const debtors = transactions.filter(t => t.type === 'DEBTOR');
  const map = new Map<string, TransactionEntity[]>();

  debtors.forEach(t => {
    const key = (t.clientInfo || t.note || 'Без имени').trim();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(t);
  });

  const result: DebtorSummaryGroup[] = [];
  map.forEach((txs, name) => {
    const totalDebt = txs.reduce((sum, item) => sum + item.amount, 0);
    result.push({ name, totalDebt, transactions: txs });
  });

  return result.sort((a, b) => b.totalDebt - a.totalDebt);
}
