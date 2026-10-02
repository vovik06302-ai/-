export type TransactionType = 'PROFIT' | 'EXPENSE' | 'DEBTOR';

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  note: string;       // Работа / заметка / за что
  clientInfo: string; // Клиент, авто, номер
  date: number;       // Timestamp (ms)
}

export interface Employee {
  id: number;
  name: string;
  salary: number;     // Месячная окладная зарплата
}

export interface SalaryPayout {
  id: number;
  employeeId: number;
  employeeName: string;
  amount: number;
  date: number;
}

export type AppThemeKey = 'BLUE' | 'GREEN' | 'PURPLE' | 'ORANGE' | 'RED';

export interface AppThemeConfig {
  key: AppThemeKey;
  label: string;
  primaryHex: string;
  bgHex: string;
  btnBg: string;
  btnHover: string;
  borderHex: string;
}

export const APP_THEMES: Record<AppThemeKey, AppThemeConfig> = {
  BLUE: {
    key: 'BLUE',
    label: 'Синяя',
    primaryHex: '#1565C0',
    bgHex: '#1e293b',
    btnBg: 'bg-blue-600',
    btnHover: 'hover:bg-blue-700',
    borderHex: '#3b82f6',
  },
  GREEN: {
    key: 'GREEN',
    label: 'Зелёная',
    primaryHex: '#2E7D32',
    bgHex: '#14532d',
    btnBg: 'bg-emerald-600',
    btnHover: 'hover:bg-emerald-700',
    borderHex: '#10b981',
  },
  PURPLE: {
    key: 'PURPLE',
    label: 'Фиолетовая',
    primaryHex: '#7B1FA2',
    bgHex: '#581c87',
    btnBg: 'bg-purple-600',
    btnHover: 'hover:bg-purple-700',
    borderHex: '#a855f7',
  },
  ORANGE: {
    key: 'ORANGE',
    label: 'Оранжевая',
    primaryHex: '#E65100',
    bgHex: '#7c2d12',
    btnBg: 'bg-amber-600',
    btnHover: 'hover:bg-amber-700',
    borderHex: '#f59e0b',
  },
  RED: {
    key: 'RED',
    label: 'Красная',
    primaryHex: '#C62828',
    bgHex: '#7f1d1d',
    btnBg: 'bg-red-600',
    btnHover: 'hover:bg-red-700',
    borderHex: '#ef4444',
  },
};

export type FilterPeriod = 'TODAY' | 'WEEK' | 'MONTH' | 'ALL_TIME';

export const FILTER_PERIOD_LABELS: Record<FilterPeriod, string> = {
  TODAY: 'Сегодня',
  WEEK: 'Неделя',
  MONTH: 'Месяц',
  ALL_TIME: 'Всё время',
};

export type AppScreen = 'MAIN' | 'REPORT';

export interface DebtorSummaryGroup {
  name: string;
  totalDebt: number;
  transactions: Transaction[];
}

export type UpdateStatus = 
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'upToDate'; currentVersion: string }
  | { status: 'available'; latestVersion: string; releaseNotes: string; downloadUrl: string }
  | { status: 'downloading'; progress: number }
  | { status: 'downloaded' }
  | { status: 'error'; message: string };
