import React, { useState } from 'react';
import { DebtorSummaryGroup } from '../types';
import { UserSearch, Search, X, ArrowLeft } from 'lucide-react';

interface Props {
  debtorSummaries: DebtorSummaryGroup[];
  onClose: () => void;
  onWriteOff: (clientName: string, amount: number, onError: (msg: string) => void) => void;
}

export const DebtorSearchModal: React.FC<Props> = ({ debtorSummaries, onClose, onWriteOff }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDebtor, setSelectedDebtor] = useState<DebtorSummaryGroup | null>(null);
  const [writeOffText, setWriteOffText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(val);
  };

  const filteredDebtors = debtorSummaries.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleWriteOff = () => {
    if (!selectedDebtor) return;
    const amount = parseFloat(writeOffText.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      setErrorMessage('Сумма списания должна быть больше 0 ₽');
      return;
    }
    if (amount > selectedDebtor.totalDebt) {
      setErrorMessage(`Сумма списания (${formatCurrency(amount)}) не может быть больше долга (${formatCurrency(selectedDebtor.totalDebt)})`);
      return;
    }

    onWriteOff(selectedDebtor.name, amount, (err) => {
      setErrorMessage(err);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            {selectedDebtor ? (
              <button
                onClick={() => {
                  setSelectedDebtor(null);
                  setErrorMessage(null);
                }}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                title="Назад к списку"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <UserSearch className="w-6 h-6 text-orange-600" />
            )}
            <h2 className="text-xl font-bold text-slate-800">
              {selectedDebtor ? 'Карточка должника' : 'Поиск должников'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!selectedDebtor ? (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="relative mb-3">
              <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Введите имя или авто..."
                className="w-full pl-10 pr-8 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredDebtors.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm">
                  {debtorSummaries.length === 0
                    ? 'Список должников пуст'
                    : `Должники по запросу «${searchQuery}» не найдены`}
                </div>
              ) : (
                filteredDebtors.map(debtor => (
                  <div
                    key={debtor.name}
                    onClick={() => {
                      setSelectedDebtor(debtor);
                      setWriteOffText('');
                      setErrorMessage(null);
                    }}
                    className="p-3 bg-slate-50 hover:bg-orange-50/70 border border-slate-200 rounded-xl cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-800">{debtor.name}</div>
                      <div className="text-xs text-slate-500">
                        Записей: {debtor.transactions.length}
                      </div>
                    </div>
                    <div className="font-extrabold text-orange-600 text-base">
                      {formatCurrency(debtor.totalDebt)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <div className="font-bold text-orange-900 text-lg">{selectedDebtor.name}</div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-orange-200/60">
                <span className="text-sm text-slate-600 font-medium">Текущий долг:</span>
                <span className="text-xl font-black text-orange-600">
                  {formatCurrency(selectedDebtor.totalDebt)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Сумма списания (₽)
              </label>
              <input
                type="number"
                step="any"
                value={writeOffText}
                onChange={e => {
                  setWriteOffText(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder={`До ${selectedDebtor.totalDebt} ₽`}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 font-semibold"
                autoFocus
              />
              {errorMessage && (
                <p className="text-xs text-red-600 mt-1 font-medium">{errorMessage}</p>
              )}
            </div>

            <button
              onClick={handleWriteOff}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow transition-colors"
            >
              Списать долг
            </button>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
