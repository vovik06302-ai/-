import React, { useState, useEffect } from 'react';
import {
  TransactionEntity,
  EmployeeEntity,
  SalaryPayoutEntity,
  AppScreen,
  FilterPeriod,
  TransactionType,
  UpdateStatus
} from './types';
import {
  loadTransactions,
  saveTransactions,
  loadEmployees,
  saveEmployees,
  loadSalaryPayouts,
  saveSalaryPayouts,
  groupDebtors
} from './storage';
import { parseVoiceCommand } from './voiceParser';
import { ThemeProvider, useAppTheme } from './components/ThemeContext';
import { Navbar } from './components/Navbar';
import { MainScreen } from './components/MainScreen';
import { ReportScreen } from './components/ReportScreen';
import { AddEditModal } from './components/AddEditModal';
import { DebtorSearchModal } from './components/DebtorSearchModal';
import { SalaryModal } from './components/SalaryModal';
import { ThemeModal } from './components/ThemeModal';
import { UpdateModal } from './components/UpdateModal';
import { Mic, Send, X } from 'lucide-react';

const MainContent: React.FC = () => {
  const { setAppTheme } = useAppTheme();

  // State
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('MAIN');
  const [transactions, setTransactions] = useState<TransactionEntity[]>(loadTransactions);
  const [employees, setEmployees] = useState<EmployeeEntity[]>(loadEmployees);
  const [payouts, setPayouts] = useState<SalaryPayoutEntity[]>(loadSalaryPayouts);
  const [selectedFilter, setSelectedFilter] = useState<FilterPeriod>('ALL_TIME');

  // Modals state
  const [activeDialogType, setActiveDialogType] = useState<TransactionType | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<TransactionEntity | null>(null);
  const [showDebtorSearch, setShowDebtorSearch] = useState(false);
  const [showSalary, setShowSalary] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);

  // Voice state
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [manualVoiceInput, setManualVoiceInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Update status state
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({ status: 'idle' });

  // Sync state to LocalStorage
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveEmployees(employees);
  }, [employees]);

  useEffect(() => {
    saveSalaryPayouts(payouts);
  }, [payouts]);

  // Toast clear timer
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Voice processing logic
  const handleProcessVoiceText = (text: string) => {
    if (!text.trim()) return;
    const command = parseVoiceCommand(text);

    switch (command.kind) {
      case 'add_transaction': {
        const newTx: TransactionEntity = {
          id: Date.now(),
          type: command.type,
          amount: command.amount,
          note: command.note,
          clientInfo: command.clientInfo,
          date: Date.now()
        };
        setTransactions(prev => [newTx, ...prev]);
        const typeName = command.type === 'PROFIT' ? 'Прибыль' : command.type === 'EXPENSE' ? 'Трата' : 'Должник';
        setToastMessage(`Добавлена ${typeName}: ${command.amount} ₽ (${command.note})`);
        break;
      }
      case 'navigate_report': {
        setCurrentScreen('REPORT');
        setToastMessage('Переход в отчёт');
        break;
      }
      case 'navigate_main': {
        setCurrentScreen('MAIN');
        setToastMessage('Переход на главный экран');
        break;
      }
      case 'navigate_back': {
        if (currentScreen === 'REPORT') {
          setCurrentScreen('MAIN');
          setToastMessage('Возврат на главный экран');
        } else {
          setToastMessage('Вы на главном экране');
        }
        break;
      }
      case 'delete_last': {
        if (transactions.length > 0) {
          setTransactions(prev => prev.slice(1));
          setToastMessage('Последняя запись удалена');
        } else {
          setToastMessage('Нет записей для удаления');
        }
        break;
      }
      case 'check_update': {
        triggerUpdateCheck();
        setToastMessage('Запущена проверка обновлений');
        break;
      }
      case 'unknown': {
        setToastMessage(`Понято: «${command.rawText}». Команда не распознана`);
        break;
      }
    }
    setManualVoiceInput('');
    setIsVoiceModalOpen(false);
  };

  // Web Speech API Voice Listening
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsVoiceModalOpen(true);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ru-RU';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        handleProcessVoiceText(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setIsVoiceModalOpen(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
      setIsVoiceModalOpen(true);
    }
  };

  // Transactions Actions
  const handleAddTransaction = (type: TransactionType, amount: number, note: string, clientInfo: string) => {
    const newTx: TransactionEntity = {
      id: Date.now(),
      type,
      amount,
      note,
      clientInfo,
      date: Date.now()
    };
    setTransactions(prev => [newTx, ...prev]);
    setActiveDialogType(null);
  };

  const handleUpdateTransaction = (updated: TransactionEntity) => {
    setTransactions(prev => prev.map(t => (t.id === updated.id ? updated : t)));
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (target: TransactionEntity) => {
    setTransactions(prev => prev.filter(t => t.id !== target.id));
  };

  const handleMarkDebtorPaid = (tx: TransactionEntity) => {
    if (tx.type !== 'DEBTOR') return;
    const updated: TransactionEntity = {
      ...tx,
      type: 'PROFIT',
      note: `Списание долга: ${tx.note || 'Долг'}`,
      date: Date.now()
    };
    setTransactions(prev => prev.map(t => (t.id === tx.id ? updated : t)));
    const clientName = tx.clientInfo || tx.note || 'Должник';
    setToastMessage(`Долг зачислен в прибыль: ${tx.amount} ₽ (${clientName})`);
  };

  const handleWriteOffDebtor = (clientName: string, writeOffAmount: number, onError: (msg: string) => void) => {
    const debtors = transactions.filter(t => t.type === 'DEBTOR');
    const clientDebtors = debtors.filter(t => {
      const name = t.clientInfo || t.note;
      return name.toLowerCase().includes(clientName.toLowerCase());
    });

    let remainingToDeduct = writeOffAmount;
    let totalDeducted = 0;
    let updatedTxs = [...transactions];

    for (const tx of clientDebtors) {
      if (remainingToDeduct <= 0) break;

      if (tx.amount <= remainingToDeduct) {
        const deducted = tx.amount;
        remainingToDeduct -= deducted;
        totalDeducted += deducted;

        updatedTxs = updatedTxs.map(item =>
          item.id === tx.id
            ? {
                ...item,
                type: 'PROFIT',
                note: `Списание долга: ${tx.note || 'Долг'}`,
                date: Date.now()
              }
            : item
        );
      } else {
        const deducted = remainingToDeduct;
        const newDebtorAmount = tx.amount - remainingToDeduct;
        remainingToDeduct = 0;
        totalDeducted += deducted;

        updatedTxs = updatedTxs.map(item =>
          item.id === tx.id ? { ...item, amount: newDebtorAmount } : item
        );

        const historyTx: TransactionEntity = {
          id: Date.now() + Math.random(),
          type: 'PROFIT',
          amount: deducted,
          note: `Частичное списание долга (${tx.note || 'Долг'})`,
          clientInfo: tx.clientInfo || clientName,
          date: Date.now()
        };
        updatedTxs.unshift(historyTx);
      }
    }

    setTransactions(updatedTxs);
    const msg = `Списано ${totalDeducted} ₽ у «${clientName}».`;
    setToastMessage(msg);
    setShowDebtorSearch(false);
  };

  // Employee Actions
  const handleAddEmployee = (name: string, salary: number, onError: (msg: string) => void) => {
    const newEmp: EmployeeEntity = { id: Date.now(), name, salary };
    setEmployees(prev => [...prev, newEmp]);
    setToastMessage(`Добавлен сотрудник «${name}» (Зарплата: ${salary} ₽)`);
  };

  const handleUpdateEmployee = (updated: EmployeeEntity, onError: (msg: string) => void) => {
    setEmployees(prev => prev.map(e => (e.id === updated.id ? updated : e)));
    setToastMessage(`Обновлены данные сотрудника «${updated.name}»`);
  };

  const handleDeleteEmployee = (emp: EmployeeEntity) => {
    setEmployees(prev => prev.filter(e => e.id !== emp.id));
    setToastMessage(`Сотрудник «${emp.name}» удалён`);
  };

  const handleAddSalaryPayout = (emp: EmployeeEntity, amount: number, onError: (msg: string) => void) => {
    const payout: SalaryPayoutEntity = {
      id: Date.now(),
      employeeId: emp.id,
      employeeName: emp.name,
      amount,
      date: Date.now()
    };
    setPayouts(prev => [payout, ...prev]);

    // Also record as expense in main transactions
    const salaryExpense: TransactionEntity = {
      id: Date.now() + 1,
      type: 'EXPENSE',
      amount,
      note: `Выплата зарплаты: ${emp.name}`,
      clientInfo: emp.name,
      date: Date.now()
    };
    setTransactions(prev => [salaryExpense, ...prev]);
    setToastMessage(`Добавлена выплата ${amount} ₽ работнику «${emp.name}»`);
  };

  // Update check trigger
  const triggerUpdateCheck = () => {
    setUpdateStatus({ status: 'checking' });
    setShowUpdate(true);

    setTimeout(() => {
      setUpdateStatus({
        status: 'update_available',
        latestVersion: 'v1.1.0',
        releaseNotes: '• Добавлена продвинутая аналитика категорий\n• Улучшено распознавание речи\n• Оптимизация быстродействия',
        downloadUrl: '#'
      });
    }, 1200);
  };

  const startDownloadUpdate = () => {
    setUpdateStatus({ status: 'downloading', progress: 0 });
    let prog = 0;
    const interval = setInterval(() => {
      prog += 20;
      if (prog >= 100) {
        clearInterval(interval);
        setUpdateStatus({ status: 'downloaded' });
        setTimeout(() => {
          setUpdateStatus({ status: 'up_to_date', currentVersion: 'v1.1.0' });
        }, 1500);
      } else {
        setUpdateStatus({ status: 'downloading', progress: prog });
      }
    }, 300);
  };

  const debtorSummaries = groupDebtors(transactions);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Toast Banner Notification */}
      {toastMessage && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-2 max-w-sm text-center">
          {toastMessage}
        </div>
      )}

      {currentScreen === 'MAIN' ? (
        <>
          <Navbar
            onOpenTheme={() => setShowTheme(true)}
            onOpenUpdate={triggerUpdateCheck}
            onOpenReport={() => setCurrentScreen('REPORT')}
            hasUpdateAvailable={updateStatus.status === 'update_available'}
          />
          <main className="flex-1">
            <MainScreen
              transactions={transactions}
              debtorSummaries={debtorSummaries}
              employees={employees}
              salaryPayouts={payouts}
              updateStatus={updateStatus}
              isVoiceListening={isListening}
              onStartVoiceInput={startSpeechRecognition}
              onOpenReport={() => setCurrentScreen('REPORT')}
              onOpenDebtorSearch={() => setShowDebtorSearch(true)}
              onOpenSalary={() => setShowSalary(true)}
              onOpenUpdate={triggerUpdateCheck}
              onOpenAddModal={type => setActiveDialogType(type)}
              onEditTransaction={tx => setEditingTransaction(tx)}
              onDeleteTransaction={handleDeleteTransaction}
              onMarkPaid={handleMarkDebtorPaid}
            />
          </main>
        </>
      ) : (
        <ReportScreen
          transactions={transactions}
          selectedFilter={selectedFilter}
          onSelectFilter={setSelectedFilter}
          onNavigateBack={() => setCurrentScreen('MAIN')}
          onMarkPaid={handleMarkDebtorPaid}
        />
      )}

      {/* MODALS */}
      {activeDialogType && (
        <AddEditModal
          type={activeDialogType}
          onClose={() => setActiveDialogType(null)}
          onSave={(amount, note, clientInfo) =>
            handleAddTransaction(activeDialogType, amount, note, clientInfo)
          }
        />
      )}

      {editingTransaction && (
        <AddEditModal
          type={editingTransaction.type}
          existingTransaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSave={(amount, note, clientInfo) =>
            handleUpdateTransaction({ ...editingTransaction, amount, note, clientInfo })
          }
        />
      )}

      {showDebtorSearch && (
        <DebtorSearchModal
          debtorSummaries={debtorSummaries}
          onClose={() => setShowDebtorSearch(false)}
          onWriteOff={handleWriteOffDebtor}
        />
      )}

      {showSalary && (
        <SalaryModal
          employees={employees}
          payouts={payouts}
          onClose={() => setShowSalary(false)}
          onAddEmployee={handleAddEmployee}
          onUpdateEmployee={handleUpdateEmployee}
          onDeleteEmployee={handleDeleteEmployee}
          onAddSalaryPayout={handleAddSalaryPayout}
        />
      )}

      {showTheme && (
        <ThemeModal
          onClose={() => setShowTheme(false)}
          onSelectTheme={theme => setAppTheme(theme)}
        />
      )}

      {showUpdate && (
        <UpdateModal
          updateStatus={updateStatus}
          onClose={() => setShowUpdate(false)}
          onCheckUpdate={triggerUpdateCheck}
          onStartDownload={startDownloadUpdate}
        />
      )}

      {/* Voice Prompt Dialog (Fallback / Testing text entry) */}
      {isVoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-800">Голосовой ввод</h3>
              </div>
              <button
                onClick={() => setIsVoiceModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Скажите или введите команду (например: «прибыль 5000 замена масла Иван BMW» или «должник 3500 Сергей Ford»):
            </p>

            <form
              onSubmit={e => {
                e.preventDefault();
                handleProcessVoiceText(manualVoiceInput);
              }}
              className="space-y-3"
            >
              <div className="relative">
                <input
                  type="text"
                  value={manualVoiceInput}
                  onChange={e => setManualVoiceInput(e.target.value)}
                  placeholder="Голосовая команда..."
                  className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 p-1 text-blue-600 hover:text-blue-800"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsVoiceModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold"
                >
                  Выполнить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <MainContent />
    </ThemeProvider>
  );
};
