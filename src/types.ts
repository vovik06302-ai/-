export type TransactionType = 'PROFIT' | 'EXPENSE' | 'DEBTOR';

export interface TransactionEntity {
  id: number;
  type: TransactionType;
  amount: number;
  note: string;
  clientInfo: string;
  date: number; // Timestamp in ms
}

export interface EmployeeEntity {
  id: number;
  name: string;
  salary: number;
}

export interface SalaryPayoutEntity {
  id: number;
  employeeId: number;
  employeeName: string;
  amount: number;
  date: number;
}

export type AppTheme = 'BLUE' | 'GREEN' | 'PURPLE' | 'ORANGE' | 'RED';

export interface ThemeConfig {
  label: string;
  primaryHex: string;
  primaryClass: string;
  bgLightClass: string;
  borderClass: string;
  ringClass: string;
}

export type FilterPeriod = 'TODAY' | 'WEEK' | 'MONTH' | 'ALL_TIME';

export interface DebtorSummaryGroup {
  name: string;
  totalDebt: number;
  transactions: TransactionEntity[];
}

export type AppScreen = 'MAIN' | 'REPORT';

export type UpdateStatus = 
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'up_to_date'; currentVersion: string }
  | { status: 'update_available'; latestVersion: string; releaseNotes: string; downloadUrl: string }
  | { status: 'downloading'; progress: number }
  | { status: 'downloaded' }
  | { status: 'error'; message: string };

export type VoiceCommand = 
  | { kind: 'add_transaction'; type: TransactionType; amount: number; note: string; clientInfo: string }
  | { kind: 'navigate_report' }
  | { kind: 'navigate_main' }
  | { kind: 'navigate_back' }
  | { kind: 'delete_last' }
  | { kind: 'check_update' }
  | { kind: 'unknown'; rawText: string };
