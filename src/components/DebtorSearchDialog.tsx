import React, { useState, useMemo } from 'react';
import { DebtorSummaryGroup } from '../types/finance';
import { Search, UserCheck, ArrowLeft, X, AlertCircle } from 'lucide-react';

interface DebtorSearchDialogProps {
  debtorSummaries: DebtorSummaryGroup[];
  onDismiss: () => void;
  onWriteOff: (clientName: string, amount: number, onError: (msg: string) => void) => void;
}

export const DebtorSearchDialog: React.FC<DebtorSearchDialogProps> = ({
  debtorSummaries,
  onDismiss,
  onWriteOff,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDebtor, setSelectedDebtor] = useState<DebtorSummaryGroup | null>(null);
  const [writeOffText, setWriteOffText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filteredDebtors = useMemo(() => {
    if (!searchQuery.trim()) return debtorSummaries;
    const q = searchQuery.toLowerCase();
    return debtorSummaries.filter((d) => d.name.toLowerCase().includes(q));
  }, [searchQuery, debtorSummaries]);

  const currencyFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  });

  const handleExecuteWriteOff = () => {
    if (!selectedDebtor) return;
    const amount = parseFloat(writeOffText.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      setErrorMessage('Введите положительную сумму для списания');
      return;
    }
    if (amount > selectedDebtor.totalDebt) {
      setErrorMessage(
        `Нельзя списать больше текущего долга (${currencyFormatter.format(selectedDebtor.totalDebt)})`
      );
      return;
    }

    onWriteOff(selectedDebtor.name, amount, (err) => {
      setErrorMessage(err);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/80 bg-slate-800/90">
          <div className="flex items-center gap-2.5">
            {selectedDebtor ? (
              <button
                onClick={() => {
                  setSelectedDebtor(null);
                  setErrorMessage(null);
                  setWriteOffText('');
                }}
                data-testid="debtor_card_back_button"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                title="Назад к списку"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <UserCheck className="w-5 h-5 text-amber-500" />
            )}
            <h3 className="text-lg font-bold text-white">
              {selectedDebtor ? 'Карточка должника' : 'Поиск должников'}
            </h3>
          </div>
          <button
            onClick={onDismiss}
            data-testid="debtor_search_close_button"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {!selectedDebtor ? (
            /* Step 1: Search & List */
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Введите имя клиента или марку авто..."
                  data-testid="debtor_search_input"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 transition-all text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs bg-slate-700 px-1.5 py-0.5 rounded"
                  >
                    Очистить
                  </button>
                )}
              </div>

              {filteredDebtors.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  {debtorSummaries.length === 0
                    ? 'Список должников пуст'
                    : `Должники по запросу «${searchQuery}» не найдены`}
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
                  {filteredDebtors.map((debtor) => (
                    <div
                      key={debtor.name}
                      onClick={() => {
                        setSelectedDebtor(debtor);
                        setErrorMessage(null);
                        setWriteOffText('');
                      }}
                      data-testid={`debtor_item_${debtor.name}`}
                      className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-slate-700/70 hover:border-amber-500/50 rounded-xl cursor-pointer hover:bg-slate-700/30 transition-all"
                    >
                      <div>
                        <h4 className="font-bold text-white text-base">{debtor.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Записей: {debtor.transactions.length}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-amber-500 text-base">
                          {currencyFormatter.format(debtor.totalDebt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Step 2: Selected Debtor Details & Write Off */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <h4 className="font-bold text-amber-400 text-lg">{selectedDebtor.name}</h4>
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span className="text-slate-300">Текущий долг:</span>
                  <span className="font-bold text-amber-400 text-lg">
                    {currencyFormatter.format(selectedDebtor.totalDebt)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Сумма списания (₽)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={writeOffText}
                  onChange={(e) => {
                    setWriteOffText(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder={`До ${Math.floor(selectedDebtor.totalDebt)} ₽`}
                  data-testid="write_off_amount_input"
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                />
                {errorMessage && (
                  <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errorMessage}
                  </p>
                )}
              </div>

              <button
                onClick={handleExecuteWriteOff}
                data-testid="execute_write_off_button"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.01]"
              >
                Списать долг
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-slate-700/80 bg-slate-800/50">
          <button
            onClick={onDismiss}
            data-testid="debtor_search_close_button"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
