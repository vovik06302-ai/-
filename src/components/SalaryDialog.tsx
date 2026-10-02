import React, { useState } from 'react';
import { Employee, SalaryPayout } from '../types/finance';
import { UserPlus, Wallet, Trash2, Edit3, ChevronDown, ChevronUp, Plus, X } from 'lucide-react';

interface SalaryDialogProps {
  employees: Employee[];
  payouts: SalaryPayout[];
  onDismiss: () => void;
  onAddEmployee: (name: string, salary: number, onError: (err: string) => void) => void;
  onUpdateEmployee: (employee: Employee, onError: (err: string) => void) => void;
  onDeleteEmployee: (employee: Employee) => void;
  onAddSalaryPayout: (employee: Employee, amount: number, onError: (err: string) => void) => void;
}

export const SalaryDialog: React.FC<SalaryDialogProps> = ({
  employees,
  payouts,
  onDismiss,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onAddSalaryPayout,
}) => {
  const [showAddEditSubDialog, setShowAddEditSubDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const currencyFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/80 bg-slate-800/90">
          <div className="flex items-center gap-2.5">
            <Wallet className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-bold text-white">Учёт зарплат</h3>
          </div>
          <button
            onClick={onDismiss}
            data-testid="salary_dialog_close_button"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <button
            onClick={() => {
              setEditingEmployee(null);
              setShowAddEditSubDialog(true);
            }}
            data-testid="add_employee_button"
            className="w-full py-2.5 px-4 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          >
            <UserPlus className="w-4 h-4" />
            Добавить сотрудника
          </button>

          {employees.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Список сотрудников пуст.<br />
              Нажмите «Добавить сотрудника», чтобы начать.
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-3.5 pr-1">
              {employees.map((emp) => {
                const empPayouts = payouts.filter((p) => p.employeeId === emp.id);
                const totalPaid = empPayouts.reduce((sum, p) => sum + p.amount, 0);
                const remaining = emp.salary - totalPaid;

                return (
                  <EmployeeCardItem
                    key={emp.id}
                    employee={emp}
                    payouts={empPayouts}
                    totalPaid={totalPaid}
                    remaining={remaining}
                    currencyFormatter={currencyFormatter}
                    onEdit={() => {
                      setEditingEmployee(emp);
                      setShowAddEditSubDialog(true);
                    }}
                    onDelete={() => onDeleteEmployee(emp)}
                    onAddPayout={(amount, onError) => onAddSalaryPayout(emp, amount, onError)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-slate-700/80 bg-slate-800/50">
          <button
            onClick={onDismiss}
            data-testid="salary_dialog_close_button"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>

      {/* Sub-dialog for Add / Edit Employee */}
      {showAddEditSubDialog && (
        <AddEditEmployeeSubDialog
          existingEmployee={editingEmployee}
          onDismiss={() => setShowAddEditSubDialog(false)}
          onSave={(name, salary, onError) => {
            if (!editingEmployee) {
              onAddEmployee(name, salary, onError);
            } else {
              onUpdateEmployee({ ...editingEmployee, name, salary }, onError);
            }
            setShowAddEditSubDialog(false);
          }}
        />
      )}
    </div>
  );
};

interface EmployeeCardItemProps {
  employee: Employee;
  payouts: SalaryPayout[];
  totalPaid: number;
  remaining: number;
  currencyFormatter: Intl.NumberFormat;
  onEdit: () => void;
  onDelete: () => void;
  onAddPayout: (amount: number, onError: (msg: string) => void) => void;
}

const EmployeeCardItem: React.FC<EmployeeCardItemProps> = ({
  employee,
  payouts,
  totalPaid,
  remaining,
  currencyFormatter,
  onEdit,
  onDelete,
  onAddPayout,
}) => {
  const [payoutInputText, setPayoutInputText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const handleAddPayoutClick = () => {
    const amount = parseFloat(payoutInputText.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      setErrorMessage('Введите сумму больше 0');
      return;
    }
    onAddPayout(amount, (err) => setErrorMessage(err));
    setPayoutInputText('');
  };

  return (
    <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-white text-base">{employee.name}</h4>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-800 transition-colors"
            title="Редактировать"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
            title="Удалить"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
        <div>
          <span className="text-slate-400 block">Оклад</span>
          <span className="font-semibold text-slate-200">
            {currencyFormatter.format(employee.salary)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block">Выдано</span>
          <span className="font-semibold text-emerald-400">
            {currencyFormatter.format(totalPaid)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block">Остаток</span>
          <span
            className={`font-bold ${
              remaining > 0 ? 'text-red-400' : 'text-emerald-400'
            }`}
          >
            {currencyFormatter.format(remaining < 0 ? 0 : remaining)}
          </span>
        </div>
      </div>

      {payouts.length > 0 && (
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center justify-between w-full text-xs text-slate-400 hover:text-slate-200 py-1"
          >
            <span>История выплат ({payouts.length})</span>
            {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showHistory && (
            <div className="mt-1 space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {payouts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between text-xs bg-slate-800/80 px-2.5 py-1.5 rounded border border-slate-700/40"
                >
                  <span className="text-slate-400">
                    {new Date(p.date).toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="font-bold text-red-400">
                    {currencyFormatter.format(p.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Payout Form */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          inputMode="decimal"
          value={payoutInputText}
          onChange={(e) => {
            setPayoutInputText(e.target.value);
            setErrorMessage(null);
          }}
          placeholder="Сумма выплаты (₽)"
          data-testid={`payout_amount_input_${employee.id}`}
          className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:border-red-500"
        />
        <button
          onClick={handleAddPayoutClick}
          data-testid={`add_payout_button_${employee.id}`}
          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-md transition-colors flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Выплата
        </button>
      </div>
      {errorMessage && (
        <p className="text-xs text-red-400 font-medium">{errorMessage}</p>
      )}
    </div>
  );
};

interface AddEditEmployeeSubDialogProps {
  existingEmployee: Employee | null;
  onDismiss: () => void;
  onSave: (name: string, salary: number, onError: (err: string) => void) => void;
}

const AddEditEmployeeSubDialog: React.FC<AddEditEmployeeSubDialogProps> = ({
  existingEmployee,
  onDismiss,
  onSave,
}) => {
  const [nameText, setNameText] = useState(existingEmployee?.name || '');
  const [salaryText, setSalaryText] = useState(
    existingEmployee ? String(existingEmployee.salary) : ''
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = () => {
    const name = nameText.trim();
    const salary = parseFloat(salaryText.replace(',', '.'));

    if (!name) {
      setErrorMessage('Имя сотрудника не может быть пустым');
      return;
    }
    if (isNaN(salary) || salary <= 0) {
      setErrorMessage('Введите корректную сумму зарплаты (больше 0 ₽)');
      return;
    }

    onSave(name, salary, (err) => setErrorMessage(err));
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
        <h4 className="text-base font-bold text-white">
          {existingEmployee ? 'Редактировать сотрудника' : 'Добавить сотрудника'}
        </h4>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Имя сотрудника</label>
          <input
            type="text"
            value={nameText}
            onChange={(e) => {
              setNameText(e.target.value);
              setErrorMessage(null);
            }}
            placeholder="Иван Иванов"
            data-testid="employee_name_input"
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Месячная зарплата (оклад ₽)</label>
          <input
            type="text"
            inputMode="decimal"
            value={salaryText}
            onChange={(e) => {
              setSalaryText(e.target.value);
              setErrorMessage(null);
            }}
            placeholder="50000"
            data-testid="employee_salary_input"
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500 text-sm"
          />
        </div>

        {errorMessage && <p className="text-xs text-red-400 font-medium">{errorMessage}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onDismiss}
            data-testid="cancel_employee_button"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            data-testid="save_employee_button"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};
