import React from 'react';
import { useAppTheme } from './ThemeContext';

interface Props {
  grandTotal: number;
  profit: number;
  debtors: number;
  expenses: number;
}

export const TotalSummaryCard: React.FC<Props> = ({ grandTotal, profit, debtors, expenses }) => {
  const { themeConfig } = useAppTheme();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className={`p-4 rounded-xl border shadow-sm ${themeConfig.bgLightClass}`}>
      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
        Общий итог
      </div>
      <div
        className={`text-3xl font-extrabold tracking-tight ${
          grandTotal >= 0 ? 'text-emerald-700' : 'text-red-700'
        }`}
      >
        {formatCurrency(grandTotal)}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200/80 grid grid-cols-3 gap-2 text-center">
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 font-medium">Прибыль</span>
          <span className="text-sm font-bold text-emerald-700">{formatCurrency(profit)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 font-medium">Должники</span>
          <span className="text-sm font-bold text-orange-600">{formatCurrency(debtors)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 font-medium">Расходники</span>
          <span className="text-sm font-bold text-red-700">{formatCurrency(expenses)}</span>
        </div>
      </div>
    </div>
  );
};
