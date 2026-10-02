package com.example.finance.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.finance.data.AppDatabase
import com.example.finance.data.TransactionEntity
import com.example.finance.data.TransactionRepository
import com.example.finance.data.TransactionType
import com.example.finance.update.UpdateManager
import com.example.finance.update.UpdateState
import com.example.finance.voice.VoiceCommand
import com.example.finance.voice.VoiceParser
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.util.Calendar

enum class AppScreen {
    MAIN,
    REPORT
}

enum class FilterPeriod(val label: String) {
    TODAY("Сегодня"),
    WEEK("Неделя"),
    MONTH("Месяц"),
    ALL_TIME("Всё время")
}

data class DebtorSummaryGroup(
    val name: String,
    val totalDebt: Double,
    val transactions: List<TransactionEntity>
)

class MainViewModel(application: Application) : AndroidViewModel(application) {

    private val repository: TransactionRepository
    val updateManager: UpdateManager

    init {
        val db = AppDatabase.getDatabase(application)
        repository = TransactionRepository(db.transactionDao())
        updateManager = UpdateManager(application)
    }

    val currentScreen = MutableStateFlow(AppScreen.MAIN)
    val selectedFilter = MutableStateFlow(FilterPeriod.ALL_TIME)

    val updateState: StateFlow<UpdateState> = updateManager.updateState

    val allTransactions: StateFlow<List<TransactionEntity>> = repository.allTransactions
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    val filteredTransactions: StateFlow<List<TransactionEntity>> = allTransactions
        .map { list ->
            filterByPeriod(list, selectedFilter.value)
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    val debtorSummaries: StateFlow<List<DebtorSummaryGroup>> = allTransactions
        .map { list ->
            list.filter { it.type == TransactionType.DEBTOR }
                .groupBy { it.clientInfo.ifBlank { it.note }.trim() }
                .map { (name, txs) ->
                    DebtorSummaryGroup(
                        name = name.ifBlank { "Без имени" },
                        totalDebt = txs.sumOf { it.amount },
                        transactions = txs
                    )
                }
                .sortedByDescending { it.totalDebt }
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    val totalProfit: StateFlow<Double> = allTransactions
        .map { list -> list.filter { it.type == TransactionType.PROFIT }.sumOf { it.amount } }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

    val totalExpenses: StateFlow<Double> = allTransactions
        .map { list -> list.filter { it.type == TransactionType.EXPENSE }.sumOf { it.amount } }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

    val totalDebtors: StateFlow<Double> = allTransactions
        .map { list -> list.filter { it.type == TransactionType.DEBTOR }.sumOf { it.amount } }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

    // Formula requested by user prompt: (прибыль + должники − траты)
    val grandTotalBalance: StateFlow<Double> = allTransactions
        .map { list ->
            val p = list.filter { it.type == TransactionType.PROFIT }.sumOf { it.amount }
            val d = list.filter { it.type == TransactionType.DEBTOR }.sumOf { it.amount }
            val e = list.filter { it.type == TransactionType.EXPENSE }.sumOf { it.amount }
            p + d - e
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

    private val _voiceFeedback = MutableStateFlow<String?>(null)
    val voiceFeedback: StateFlow<String?> = _voiceFeedback.asStateFlow()

    fun addTransaction(type: TransactionType, amount: Double, note: String, clientInfo: String) {
        viewModelScope.launch {
            repository.insert(
                TransactionEntity(
                    type = type,
                    amount = amount,
                    note = note,
                    clientInfo = clientInfo,
                    date = System.currentTimeMillis()
                )
            )
        }
    }

    fun updateTransaction(transaction: TransactionEntity) {
        viewModelScope.launch {
            repository.update(transaction)
        }
    }

    fun deleteTransaction(transaction: TransactionEntity) {
        viewModelScope.launch {
            repository.delete(transaction)
        }
    }

    fun markDebtorAsPaid(transaction: TransactionEntity) {
        viewModelScope.launch {
            repository.markDebtorPaid(transaction)
            _voiceFeedback.value = "Долг зачислен в прибыль: ${transaction.amount.toInt()} ₽ (${transaction.clientInfo.ifBlank { transaction.note }})"
        }
    }

    fun writeOffDebtor(clientName: String, amount: Double, onResult: (Boolean, String) -> Unit) {
        viewModelScope.launch {
            val currentGroup = debtorSummaries.value.find { it.name.equals(clientName, ignoreCase = true) }
            val maxDebt = currentGroup?.totalDebt ?: 0.0

            if (amount <= 0) {
                onResult(false, "Сумма списания должна быть больше 0 ₽")
                return@launch
            }
            if (amount > maxDebt) {
                onResult(false, "Сумма списания (${amount.toInt()} ₽) не может быть больше долга (${maxDebt.toInt()} ₽)")
                return@launch
            }

            val deducted = repository.writeOffDebtor(clientName, amount)
            val remainingDebt = maxDebt - deducted

            val msg = "Списано ${deducted.toInt()} ₽ у «$clientName». Остаток долга: ${remainingDebt.toInt()} ₽"
            _voiceFeedback.value = msg
            onResult(true, msg)
        }
    }

    fun deleteLastTransaction() {
        viewModelScope.launch {
            val deleted = repository.deleteLast()
            if (deleted) {
                _voiceFeedback.value = "Последняя запись удалена"
            } else {
                _voiceFeedback.value = "Нет записей для удаления"
            }
        }
    }

    fun setFilterPeriod(period: FilterPeriod) {
        selectedFilter.value = period
    }

    fun processVoiceInput(spokenText: String) {
        val command = VoiceParser.parseCommand(spokenText)
        when (command) {
            is VoiceCommand.AddTransaction -> {
                addTransaction(command.type, command.amount, command.note, command.clientInfo)
                val typeName = when (command.type) {
                    TransactionType.PROFIT -> "Прибыль"
                    TransactionType.EXPENSE -> "Трата"
                    TransactionType.DEBTOR -> "Должник"
                }
                _voiceFeedback.value = "Добавлена $typeName: ${command.amount.toInt()} ₽ (${command.note})"
            }

            is VoiceCommand.NavigateReport -> {
                currentScreen.value = AppScreen.REPORT
                _voiceFeedback.value = "Переход в отчёт"
            }

            is VoiceCommand.NavigateMain -> {
                currentScreen.value = AppScreen.MAIN
                _voiceFeedback.value = "Переход на главный экран"
            }

            is VoiceCommand.NavigateBack -> {
                if (currentScreen.value == AppScreen.REPORT) {
                    currentScreen.value = AppScreen.MAIN
                    _voiceFeedback.value = "Возврат на главный экран"
                } else {
                    _voiceFeedback.value = "Вы на главном экране"
                }
            }

            is VoiceCommand.DeleteLast -> {
                deleteLastTransaction()
            }

            is VoiceCommand.CheckUpdate -> {
                _voiceFeedback.value = "Запущена проверка обновлений"
                triggerUpdateCheck()
            }

            is VoiceCommand.Unknown -> {
                _voiceFeedback.value = "Понято: «${command.rawText}». Команда не распознана"
            }
        }
    }

    fun clearVoiceFeedback() {
        _voiceFeedback.value = null
    }

    fun triggerUpdateCheck() {
        viewModelScope.launch {
            updateManager.checkForUpdates()
        }
    }

    fun startApkDownload(downloadUrl: String) {
        viewModelScope.launch {
            updateManager.downloadAndInstallApk(downloadUrl)
        }
    }

    private fun filterByPeriod(list: List<TransactionEntity>, period: FilterPeriod): List<TransactionEntity> {
        val now = Calendar.getInstance()
        val startOfPeriod = Calendar.getInstance().apply {
            when (period) {
                FilterPeriod.TODAY -> {
                    set(Calendar.HOUR_OF_DAY, 0)
                    set(Calendar.MINUTE, 0)
                    set(Calendar.SECOND, 0)
                    set(Calendar.MILLISECOND, 0)
                }

                FilterPeriod.WEEK -> {
                    add(Calendar.DAY_OF_YEAR, -7)
                }

                FilterPeriod.MONTH -> {
                    add(Calendar.DAY_OF_YEAR, -30)
                }

                FilterPeriod.ALL_TIME -> {
                    timeInMillis = 0
                }
            }
        }.timeInMillis

        return list.filter { it.date >= startOfPeriod }
    }
}
