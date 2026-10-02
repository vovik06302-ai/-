import React, { useState } from 'react';
import { TransactionEntity, TransactionType, DebtorSummaryGroup, EmployeeEntity, SalaryPayoutEntity, UpdateStatus } from '../types';
import { TotalSummaryCard } from './TotalSummaryCard';
import { TrendingUp, ArrowDownRight, PlusCircle, UserSearch, BadgeCheck, Mic, Edit2, Trash2, CheckCircle, RefreshCw } from 'lucide-react';

interface Props {
  transactions: TransactionEntity[];
  debtorSummaries: DebtorSummaryGroup[];
  employees: EmployeeEntity[];
  salaryPayouts: SalaryPayoutEntity[];
  updateStatus: UpdateStatus;
  isVoiceListening: boolean;
  onStartVoiceInput: () => void;
  onOpenReport: () => void;
  onOpenDebtorSearch: () => void;
  onOpenSalary: () => void;
  onOpenUpdate: () => void;
  onOpenAddModal: (type: TransactionType) => void;
  onEditTransaction: (tx: TransactionEntity) => void;
  onDeleteTransaction: (tx: TransactionEntity) => void;
  onMarkPaid: (tx: TransactionEntity) => void;
}

export const MainScreen: React.FC<Props> = ({
  transactions,
  debtorSummaries,
  employees,
  salaryPayouts,
  updateStatus,
  isVoiceListening,
  onStartVoiceInput,
  onOpenReport,
  onOpenDebtorSearch,
  onOpenSalary,
  onOpenUpdate,
  onOpenAddModal,
  onEditTransaction,
  onDeleteTransaction,
  onMarkPaid
}) => {
  const profit = transactions.filter(t => t.type === 'PROFIT').reduce((sum, t) => sum + t.amount, 0);
  const debtors = transactions.filter(t => t.type === 'DEBTOR').reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
  const grandTotal = profit + debtors - expenses;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-20 space-y-4 relative">
      {/* 1. TOTAL SUMMARY CARD */}
      <TotalSummaryCard
        grandTotal={grandTotal}
        profit={profit}
        debtors={debtors}
        expenses={expenses}
      />

      {/* Update Availability Banner */}
      {updateStatus.status === 'update_available' && (
        <div
          onClick={onOpenUpdate}
          className="p-3 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer hover:bg-amber-100/80 transition-colors flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <RefreshCw className="w-5 h-5 text-amber-600 animate-spin" />
            <div>
              <div className="text-xs font-bold text-amber-900">
                Есть обновление {updateStatus.latestVersion}
              </div>
              <div className="text-[11px] text-amber-700">Нажмите, чтобы обновить приложение</div>
            </div>
          </div>
          <button className="px-3 py-1 bg-amber-600 text-white font-bold text-xs rounded-lg shadow">
            Обновить
          </button>
        </div>
      )}

      {/* ACTION ROW: «Найти должника» & «Зарплата» */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onOpenDebtorSearch}
          className="p-3 bg-slate-200/80 hover:bg-slate-300/80 text-slate-800 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <UserSearch className="w-4 h-4 text-orange-600" />
          <span>Должники</span>
        </button>

        <button
          onClick={onOpenSalary}
          className="p-3 bg-red-100 hover:bg-red-200/80 text-red-800 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <BadgeCheck className="w-4 h-4 text-red-600" />
          <span>Зарплата</span>
        </button>
      </div>

      {/* 2. THREE QUICK ACTION BUTTONS */}
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Быстрый ввод
        </div>
        <div className="grid grid-cols-3 gap-2">
          {/* Profit Button */}
          <button
            onClick={() => onOpenAddModal('PROFIT')}
            className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm group"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-800">Прибыль</span>
          </button>

          {/* Expense Button */}
          <button
            onClick={() => onOpenAddModal('EXPENSE')}
            className="p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm group"
          >
            <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-red-800">Траты</span>
          </button>

          {/* Debtor Button */}
          <button
            onClick={() => onOpenAddModal('DEBTOR')}
            className="p-3 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm group"
          >
            <div className="w-9 h-9 rounded-full bg-orange-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-orange-800">Должники</span>
          </button>
        </div>
      </div>

      {/* 3. RECENT TRANSACTIONS LIST */}
      <div className="space-y-2">
        <div className="flex items-center justify-between pt-2">
          <h2 className="text-base font-bold text-slate-800">
            Все записи ({transactions.length})
          </h2>
          <button
            onClick={onOpenReport}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 underline"
          >
            Подробный отчёт
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 text-slate-500 text-sm">
            Записей пока нет.<br />
            Нажмите на кнопку выше или воспользуйтесь голосовой командой.
          </div>
        ) : (
          <div className="space-y-2.5">
            {transactions.map(item => {
              const isProfit = item.type === 'PROFIT';
              const isExpense = item.type === 'EXPENSE';
              const isDebtor = item.type === 'DEBTOR';

              const colorClass = isProfit ? 'text-emerald-700' : isExpense ? 'text-red-700' : 'text-orange-600';
              const badgeBg = isProfit ? 'bg-emerald-500' : isExpense ? 'bg-red-500' : 'bg-orange-500';
              const typeLabel = isProfit ? 'Прибыль' : isExpense ? 'Трата' : 'Должник';

              return (
                <div
                  key={item.id}
                  className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-2 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${badgeBg}`} />
                      <span className={`text-xs font-bold uppercase tracking-wider ${colorClass}`}>
                        {typeLabel}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(item.date).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900 text-sm leading-snug">
                        {item.note || 'Без описания'}
                      </div>
                      {item.clientInfo && (
                        <div className="text-xs text-slate-500 mt-0.5">{item.clientInfo}</div>
                      )}
                    </div>
                    <div className={`font-black text-lg whitespace-nowrap ${colorClass}`}>
                      {isExpense ? '- ' : '+ '}{formatCurrency(item.amount)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-100">
                    {isDebtor && (
                      <button
                        onClick={() => onMarkPaid(item)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-sm mr-auto"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Должник оплатил</span>
                      </button>
                    )}

                    <button
                      onClick={() => onEditTransaction(item)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Редактировать"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteTransaction(item)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Voice Button (Bottom Left as in Jetpack Compose Scaffold!) */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={onStartVoiceInput}
          className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all transform active:scale-95 ${
            isVoiceListening
              ? 'bg-red-600 animate-pulse ring-4 ring-red-300'
              : 'bg-blue-700 hover:bg-blue-800 ring-2 ring-blue-400/50'
          }`}
          title="Голосовая команда"
        >
          <Mic className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
