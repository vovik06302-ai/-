import React from 'react';
import { TransactionEntity, FilterPeriod } from '../types';
import { exportAndShareCsv } from '../csvExporter';
import { ArrowLeft, Download, CheckCircle } from 'lucide-react';

interface Props {
  transactions: TransactionEntity[];
  selectedFilter: FilterPeriod;
  onSelectFilter: (period: FilterPeriod) => void;
  onNavigateBack: () => void;
  onMarkPaid: (tx: TransactionEntity) => void;
}

export const ReportScreen: React.FC<Props> = ({
  transactions,
  selectedFilter,
  onSelectFilter,
  onNavigateBack,
  onMarkPaid
}) => {
  const filterByPeriod = (list: TransactionEntity[], period: FilterPeriod) => {
    const now = new Date();
    let startTime = 0;

    if (period === 'TODAY') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      startTime = today.getTime();
    } else if (period === 'WEEK') {
      startTime = now.getTime() - 7 * 24 * 3600 * 1000;
    } else if (period === 'MONTH') {
      startTime = now.getTime() - 30 * 24 * 3600 * 1000;
    }

    return list.filter(t => t.date >= startTime);
  };

  const filtered = filterByPeriod(transactions, selectedFilter);

  const profitItems = filtered.filter(t => t.type === 'PROFIT');
  const debtorItems = filtered.filter(t => t.type === 'DEBTOR');
  const expenseItems = filtered.filter(t => t.type === 'EXPENSE');

  const profitSum = profitItems.reduce((acc, t) => acc + t.amount, 0);
  const debtorsSum = debtorItems.reduce((acc, t) => acc + t.amount, 0);
  const expensesSum = expenseItems.reduce((acc, t) => acc + t.amount, 0);
  const grandTotal = profitSum + debtorsSum - expensesSum;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(val);
  };

  const filterOptions: { key: FilterPeriod; label: string }[] = [
    { key: 'TODAY', label: 'Сегодня' },
    { key: 'WEEK', label: 'Неделя' },
    { key: 'MONTH', label: 'Месяц' },
    { key: 'ALL_TIME', label: 'Всё время' }
  ];

  const handleExportCsv = () => {
    const filterLabel = filterOptions.find(f => f.key === selectedFilter)?.label || 'Отчёт';
    exportAndShareCsv(filtered, filterLabel);
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-12">
      {/* Top Bar */}
      <div className="bg-slate-800 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateBack}
              className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold">Финансовый отчёт</h1>
          </div>

          <button
            onClick={handleExportCsv}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            title="Экспорт в CSV"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Period Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {filterOptions.map(f => (
            <button
              key={f.key}
              onClick={() => onSelectFilter(f.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-sm ${
                selectedFilter === f.key
                  ? 'bg-blue-700 text-white shadow-blue-500/20'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* 1. Profit Card */}
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <div className="text-emerald-900 font-bold text-base">Прибыль (Оплачено)</div>
            <div className="text-xs text-slate-500">Записей: {profitItems.length}</div>
          </div>
          <div className="text-xl font-black text-emerald-700">{formatCurrency(profitSum)}</div>
        </div>

        {/* 2. Debtors Card + List */}
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <div className="text-orange-950 font-bold text-base">Должники (Не оплачено)</div>
            <div className="text-xs text-slate-500">Записей: {debtorItems.length}</div>
          </div>
          <div className="text-xl font-black text-orange-600">{formatCurrency(debtorsSum)}</div>
        </div>

        {debtorItems.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-orange-800 uppercase tracking-wider px-1">
              Список должников (Кто, авто, за что, сколько):
            </h3>

            {debtorItems.map(debtor => (
              <div key={debtor.id} className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-orange-900 text-sm">
                    {debtor.clientInfo || 'Клиент не указан'}
                  </div>
                  <div className="font-extrabold text-orange-600 text-base">
                    {formatCurrency(debtor.amount)}
                  </div>
                </div>

                <div className="text-xs text-slate-700">
                  <span className="font-medium text-slate-500">За что: </span>
                  {debtor.note || 'Замена деталей / услуга'}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">
                    {new Date(debtor.date).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button
                    onClick={() => onMarkPaid(debtor)}
                    className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Должник оплатил</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. Expenses Card */}
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <div className="text-red-950 font-bold text-base">Траты (Расходы)</div>
            <div className="text-xs text-slate-500">Записей: {expenseItems.length}</div>
          </div>
          <div className="text-xl font-black text-red-700">{formatCurrency(expensesSum)}</div>
        </div>

        {/* 4. Grand Total Summary Card */}
        <div className="p-5 bg-blue-900 text-white rounded-2xl shadow-md border border-blue-800">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-200 mb-1">
            ОБЩИЙ ИТОГ (Прибыль + Должники − Траты)
          </div>
          <div
            className={`text-3xl font-black ${
              grandTotal >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {formatCurrency(grandTotal)}
          </div>
        </div>

        {/* CSV Export Button */}
        <button
          onClick={handleExportCsv}
          className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          <span>Экспортировать отчёт в CSV</span>
        </button>
      </div>
    </div>
  );
};
