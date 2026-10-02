import React, { useState, useEffect } from 'react';
import { TransactionEntity, TransactionType } from '../types';
import { useAppTheme } from './ThemeContext';

interface Props {
  type: TransactionType;
  existingTransaction?: TransactionEntity | null;
  onClose: () => void;
  onSave: (amount: number, note: string, clientInfo: string) => void;
}

export const AddEditModal: React.FC<Props> = ({ type, existingTransaction, onClose, onSave }) => {
  const { themeConfig } = useAppTheme();
  const [amountText, setAmountText] = useState(existingTransaction?.amount.toString() || '');
  const [noteText, setNoteText] = useState(existingTransaction?.note || '');
  const [clientInfoText, setClientInfoText] = useState(existingTransaction?.clientInfo || '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingTransaction) {
      setAmountText(existingTransaction.amount.toString());
      setNoteText(existingTransaction.note);
      setClientInfoText(existingTransaction.clientInfo);
    }
  }, [existingTransaction]);

  const title = existingTransaction
    ? 'Редактировать запись'
    : type === 'PROFIT'
    ? 'Добавить прибыль'
    : type === 'EXPENSE'
    ? 'Добавить расходники'
    : 'Добавить должника';

  const noteLabel = type === 'PROFIT' ? 'Работа / заметка' : type === 'EXPENSE' ? 'Описание / заметка' : 'Работа / за что';
  const clientLabel = type === 'PROFIT' ? 'Авто / номер' : type === 'EXPENSE' ? 'Детали / инфо (необязательно)' : 'Клиент, авто, номер';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amountText.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) {
      setError('Введите корректную сумму больше 0 ₽');
      return;
    }

    onSave(parsed, noteText.trim(), clientInfoText.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
        <h2 className="text-xl font-bold text-slate-800 mb-4">{title}</h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Сумма (₽)</label>
            <input
              type="number"
              step="any"
              value={amountText}
              onChange={e => {
                setAmountText(e.target.value);
                setError(null);
              }}
              placeholder="0"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
              autoFocus
            />
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{noteLabel}</label>
            <input
              type="text"
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Например: Замена масла"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{clientLabel}</label>
            <input
              type="text"
              value={clientInfoText}
              onChange={e => setClientInfoText(e.target.value)}
              placeholder="Например: Иван Ford Focus A123AA"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${themeConfig.primaryClass}`}
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
