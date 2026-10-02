import React, { useState } from 'react';
import { EmployeeEntity, SalaryPayoutEntity } from '../types';
import { BadgeCheck, Plus, Edit2, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react';

interface Props {
  employees: EmployeeEntity[];
  payouts: SalaryPayoutEntity[];
  onClose: () => void;
  onAddEmployee: (name: string, salary: number, onError: (msg: string) => void) => void;
  onUpdateEmployee: (employee: EmployeeEntity, onError: (msg: string) => void) => void;
  onDeleteEmployee: (employee: EmployeeEntity) => void;
  onAddSalaryPayout: (employee: EmployeeEntity, amount: number, onError: (msg: string) => void) => void;
}

export const SalaryModal: React.FC<Props> = ({
  employees,
  payouts,
  onClose,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onAddSalaryPayout
}) => {
  const [showAddEditSubModal, setShowAddEditSubModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeEntity | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-slate-800">Учёт зарплат</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Salary Summary Across All Employees */}
        {employees.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-4 space-y-1.5 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Общая зарплата по всем сотрудникам
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block">Общий оклад</span>
                <span className="font-bold text-slate-900 text-sm">
                  {formatCurrency(employees.reduce((sum, e) => sum + e.salary, 0))}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Выдано всего</span>
                <span className="font-bold text-emerald-700 text-sm">
                  {formatCurrency(payouts.reduce((sum, p) => sum + p.amount, 0))}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">К выплате</span>
                <span className="font-bold text-red-700 text-sm">
                  {formatCurrency(
                    employees.reduce((sum, e) => {
                      const paid = payouts
                        .filter((p) => p.employeeId === e.id)
                        .reduce((s, p) => s + p.amount, 0);
                      return sum + Math.max(0, e.salary - paid);
                    }, 0)
                  )}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => {
            setEditingEmployee(null);
            setShowAddEditSubModal(true);
          }}
          className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow mb-4 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Добавить сотрудника</span>
        </button>

        {/* Employee List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
          {employees.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              Список сотрудников пуст.<br />
              Нажмите «Добавить сотрудника», чтобы начать.
            </div>
          ) : (
            employees.map(employee => {
              const empPayouts = payouts.filter(p => p.employeeId === employee.id);
              return (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  payouts={empPayouts}
                  formatCurrency={formatCurrency}
                  onEdit={() => {
                    setEditingEmployee(employee);
                    setShowAddEditSubModal(true);
                  }}
                  onDelete={() => onDeleteEmployee(employee)}
                  onAddPayout={(amount, onError) => onAddSalaryPayout(employee, amount, onError)}
                />
              );
            })
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>

      {/* Sub-modal for Add/Edit Employee */}
      {showAddEditSubModal && (
        <AddEditEmployeeModal
          existingEmployee={editingEmployee}
          onClose={() => setShowAddEditSubModal(false)}
          onSave={(name, salary, onError) => {
            if (editingEmployee) {
              onUpdateEmployee({ ...editingEmployee, name, salary }, onError);
            } else {
              onAddEmployee(name, salary, onError);
            }
            setShowAddEditSubModal(false);
          }}
        />
      )}
    </div>
  );
};

interface EmployeeCardProps {
  employee: EmployeeEntity;
  payouts: SalaryPayoutEntity[];
  formatCurrency: (val: number) => string;
  onEdit: () => void;
  onDelete: () => void;
  onAddPayout: (amount: number, onError: (msg: string) => void) => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  payouts,
  formatCurrency,
  onEdit,
  onDelete,
  onAddPayout
}) => {
  const [payoutInput, setPayoutInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const totalPaid = payouts.reduce((sum, p) => sum + p.amount, 0);
  const remaining = employee.salary - totalPaid;

  const handlePayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(payoutInput.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      setErrorMsg('Введите сумму больше 0 ₽');
      return;
    }
    onAddPayout(amount, (err) => setErrorMsg(err));
    setPayoutInput('');
  };

  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-900 text-base">{employee.name}</span>
        <div className="flex items-center gap-1">
          <button onClick={onEdit} className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="text-xs space-y-1">
        <div className="text-slate-600">Месячный оклад: <span className="font-semibold text-slate-900">{formatCurrency(employee.salary)}</span></div>
        <div className="text-emerald-700 font-medium">Выдано частями: <span className="font-bold">{formatCurrency(totalPaid)}</span></div>
        <div className={remaining > 0 ? 'text-red-700 font-bold' : 'text-emerald-700 font-bold'}>
          Остаток к выплате: {formatCurrency(Math.max(0, remaining))}
        </div>
      </div>

      {payouts.length > 0 && (
        <div className="border-t border-slate-200/60 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold">История выплат ({payouts.length}):</span>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-blue-600 hover:underline flex items-center gap-0.5"
            >
              <span>{showHistory ? 'Скрыть' : 'Показать'}</span>
              {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showHistory && (
            <div className="mt-2 space-y-1 max-h-32 overflow-y-auto pr-1">
              {payouts.map(p => (
                <div key={p.id} className="flex items-center justify-between text-xs p-1.5 bg-white rounded border border-slate-100">
                  <span className="text-slate-500">
                    {new Date(p.date).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="font-bold text-red-600">{formatCurrency(p.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handlePayoutSubmit} className="flex gap-2 items-center pt-1">
        <input
          type="number"
          step="any"
          value={payoutInput}
          onChange={e => {
            setPayoutInput(e.target.value);
            setErrorMsg(null);
          }}
          placeholder="Сумма выплаты"
          className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900"
        />
        <button
          type="submit"
          className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
        >
          Выплатить
        </button>
      </form>
      {errorMsg && <p className="text-xs text-red-600 font-medium">{errorMsg}</p>}
    </div>
  );
};

interface AddEditEmployeeModalProps {
  existingEmployee: EmployeeEntity | null;
  onClose: () => void;
  onSave: (name: string, salary: number, onError: (msg: string) => void) => void;
}

const AddEditEmployeeModal: React.FC<AddEditEmployeeModalProps> = ({
  existingEmployee,
  onClose,
  onSave
}) => {
  const [name, setName] = useState(existingEmployee?.name || '');
  const [salary, setSalary] = useState(existingEmployee?.salary.toString() || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Имя сотрудника не может быть пустым');
      return;
    }
    const parsedSalary = parseFloat(salary.replace(',', '.'));
    if (isNaN(parsedSalary) || parsedSalary <= 0) {
      setError('Введите корректную сумму зарплаты (больше 0 ₽)');
      return;
    }
    onSave(name.trim(), parsedSalary, (err) => setError(err));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95">
        <h3 className="text-lg font-bold text-slate-800 mb-4">
          {existingEmployee ? 'Редактировать сотрудника' : 'Добавить сотрудника'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Имя сотрудника</label>
            <input
              type="text"
              value={name}
              onChange={e => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="Иван Иванов"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Месячная зарплата (₽)</label>
            <input
              type="number"
              step="any"
              value={salary}
              onChange={e => {
                setSalary(e.target.value);
                setError(null);
              }}
              placeholder="50000"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium text-sm"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-medium text-sm"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
