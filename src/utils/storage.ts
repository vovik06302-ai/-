import { Transaction, Employee, SalaryPayout, AppThemeKey } from '../types/finance';

const STORAGE_KEY_TRANSACTIONS = 'autofinance_transactions';
const STORAGE_KEY_EMPLOYEES = 'autofinance_employees';
const STORAGE_KEY_PAYOUTS = 'autofinance_payouts';
const STORAGE_KEY_THEME = 'autofinance_theme';

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    type: 'PROFIT',
    amount: 12500,
    note: 'Замена тормозных дисков и колодок',
    clientInfo: 'BMW X5 (А777АА77)',
    date: Date.now() - 3600000 * 2,
  },
  {
    id: 2,
    type: 'PROFIT',
    amount: 8500,
    note: 'Замена масла и фильтров',
    clientInfo: 'Toyota Camry (В123ООР)',
    date: Date.now() - 3600000 * 18,
  },
  {
    id: 3,
    type: 'EXPENSE',
    amount: 4200,
    note: 'Закупка оригинального масла и масляных фильтров',
    clientInfo: 'Магазин АвтоЗапчасти',
    date: Date.now() - 3600000 * 24,
  },
  {
    id: 4,
    type: 'DEBTOR',
    amount: 15000,
    note: 'Капитальный ремонт ходовой',
    clientInfo: 'Сергей (Ford Focus)',
    date: Date.now() - 3600000 * 30,
  },
  {
    id: 5,
    type: 'DEBTOR',
    amount: 6500,
    note: 'Ремонт генератора и замена ремня',
    clientInfo: 'Алексей (Kia Rio)',
    date: Date.now() - 3600000 * 48,
  },
  {
    id: 6,
    type: 'EXPENSE',
    amount: 25000,
    note: 'Выплата зарплаты: Александр (Автомеханик)',
    clientInfo: 'Александр (Автомеханик)',
    date: Date.now() - 3600000 * 72,
  },
];

const INITIAL_EMPLOYEES: Employee[] = [
  { id: 1, name: 'Александр (Автомеханик)', salary: 65000 },
  { id: 2, name: 'Михаил (Автоэлектрик)', salary: 70000 },
];

const INITIAL_PAYOUTS: SalaryPayout[] = [
  {
    id: 1,
    employeeId: 1,
    employeeName: 'Александр (Автомеханик)',
    amount: 25000,
    date: Date.now() - 3600000 * 72,
  },
];

export function getStoredTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    if (!raw) {
      saveStoredTransactions(INITIAL_TRANSACTIONS);
      return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading transactions from storage', e);
    return INITIAL_TRANSACTIONS;
  }
}

export function saveStoredTransactions(items: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving transactions', e);
  }
}

export function getStoredEmployees(): Employee[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EMPLOYEES);
    if (!raw) {
      saveStoredEmployees(INITIAL_EMPLOYEES);
      return INITIAL_EMPLOYEES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading employees', e);
    return INITIAL_EMPLOYEES;
  }
}

export function saveStoredEmployees(items: Employee[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving employees', e);
  }
}

export function getStoredPayouts(): SalaryPayout[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PAYOUTS);
    if (!raw) {
      saveStoredPayouts(INITIAL_PAYOUTS);
      return INITIAL_PAYOUTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading payouts', e);
    return INITIAL_PAYOUTS;
  }
}

export function saveStoredPayouts(items: SalaryPayout[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PAYOUTS, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving payouts', e);
  }
}

export function getStoredTheme(): AppThemeKey {
  try {
    const theme = localStorage.getItem(STORAGE_KEY_THEME) as AppThemeKey;
    if (theme && ['BLUE', 'GREEN', 'PURPLE', 'ORANGE', 'RED'].includes(theme)) {
      return theme;
    }
  } catch (e) {
    // ignore
  }
  return 'BLUE';
}

export function saveStoredTheme(theme: AppThemeKey): void {
  try {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  } catch (e) {
    console.error('Error saving theme', e);
  }
}
