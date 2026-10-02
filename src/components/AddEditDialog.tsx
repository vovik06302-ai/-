import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types/finance';
import { PlusCircle, Edit3, X } from 'lucide-react';

interface AddEditDialogProps {
  type: TransactionType;
  existingTransaction?: Transaction | null;
  onDismiss: () => void;
  onSave: (amount: number, note: string, clientInfo: string) => void;
}

export const AddEditDialog: React.FC<AddEditDialogProps> = ({
  type,
  existingTransaction,
  onDismiss,
  onSave,
}) => {
  const [amountText, setAmountText] = useState<string>(
    existingTransaction ? String(existingTransaction.amount) : ''
  );
  const [noteText, setNoteText] = useState<string>(existingTransaction?.note || '');
  const [clientInfoText, setClientInfoText] = useState<string>(existingTransaction?.clientInfo || '');
  const [amountError, setAmountError] = useState<boolean>(false);

  const isEdit = !!existingTransaction;

  const title = isEdit
    ? 'Редактировать запись'
    : type === 'PROFIT'
    ? 'Добавить прибыль'
    : type === 'EXPENSE'
    ? 'Добавить трату'
    : 'Добавить должника';

  const noteLabel =
    type === 'PROFIT'
      ? 'Работа / заметка'
      : type === 'EXPENSE'
      ? 'Описание / заметка'
      : 'Работа / за что';

  const clientLabel =
    type === 'PROFIT'
      ? 'Авто / номер'
      : type === 'EXPENSE'
      ? 'Детали / инфо (необязательно)'
      : 'Клиент, авто, номер';

  const handleSave = () => {
    const parsed = parseFloat(amountText.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) {
      setAmountError(true);
      return;
    }
    onSave(parsed, noteText.trim(), clientInfoText.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/80 bg-slate-800/90">
          <div className="flex items-center gap-2">
            {isEdit ? <Edit3 className="w-5 h-5 text-blue-400" /> : <PlusCircle className="w-5 h-5 text-blue-400" />}
            <h3 className="text-lg font-bold text-white">{title}</h3>
          </div>
          <button
            onClick={onDismiss}
            data-testid="dialog_cancel_button"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Сумма (₽)</label>
            <input
              type="text"
              inputMode="decimal"
              value={amountText}
              onChange={(e) => {
                setAmountText(e.target.value);
                setAmountError(false);
              }}
              placeholder="1000"
              data-testid="dialog_amount_input"
              className={`w-full px-3.5 py-2.5 bg-slate-900/80 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                amountError
                  ? 'border-red-500 focus:ring-red-500/50'
                  : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500/30'
              }`}
            />
            {amountError && (
              <p className="mt-1 text-xs text-red-400 font-medium">Введите корректную сумму больше 0 ₽</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">{noteLabel}</label>
            <input
              type="text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Замена тормозных дисков..."
              data-testid="dialog_note_input"
              className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">{clientLabel}</label>
            <input
              type="text"
              value={clientInfoText}
              onChange={(e) => setClientInfoText(e.target.value)}
              placeholder="Иван (BMW X5)..."
              data-testid="dialog_client_input"
              className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-slate-700/80 bg-slate-800/50">
          <button
            onClick={onDismiss}
            data-testid="dialog_cancel_button"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            data-testid="dialog_save_button"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};
