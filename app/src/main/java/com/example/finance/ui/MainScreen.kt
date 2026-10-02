package com.example.finance.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Assessment
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.MoneyOff
import androidx.compose.material.icons.filled.PersonSearch
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.SystemUpdate
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.finance.data.TransactionEntity
import com.example.finance.data.TransactionType
import com.example.finance.update.UpdateState
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    viewModel: MainViewModel,
    onStartVoiceInput: () -> Unit,
    isVoiceListening: Boolean,
    onOpenReport: () -> Unit
) {
    val grandTotal by viewModel.grandTotalBalance.collectAsStateWithLifecycle()
    val totalProfit by viewModel.totalProfit.collectAsStateWithLifecycle()
    val totalExpenses by viewModel.totalExpenses.collectAsStateWithLifecycle()
    val totalDebtors by viewModel.totalDebtors.collectAsStateWithLifecycle()
    val transactions by viewModel.allTransactions.collectAsStateWithLifecycle()
    val voiceFeedback by viewModel.voiceFeedback.collectAsStateWithLifecycle()
    val updateState by viewModel.updateState.collectAsStateWithLifecycle()

    var activeDialogType by remember { mutableStateOf<TransactionType?>(null) }
    var editingTransaction by remember { mutableStateOf<TransactionEntity?>(null) }
    var showUpdateDialog by remember { mutableStateOf(false) }
    var showDebtorSearchDialog by remember { mutableStateOf(false) }

    val currencyFormat = remember { NumberFormat.getCurrencyInstance(Locale("ru", "RU")).apply { maximumFractionDigits = 0 } }
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(voiceFeedback) {
        voiceFeedback?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearVoiceFeedback()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "АвтоФинансы",
                        fontWeight = FontWeight.Bold
                    )
                },
                actions = {
                    // Update check button
                    IconButton(
                        onClick = {
                            viewModel.triggerUpdateCheck()
                            showUpdateDialog = true
                        },
                        modifier = Modifier.testTag("github_update_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.SystemUpdate,
                            contentDescription = "Проверить обновления",
                            tint = if (updateState is UpdateState.UpdateAvailable) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface
                        )
                    }

                    // Report Screen Navigation Button
                    IconButton(
                        onClick = onOpenReport,
                        modifier = Modifier.testTag("nav_report_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Assessment,
                            contentDescription = "Отчёт"
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            )
        },
        floatingActionButton = {
            // Voice Command Floating Action Button
            FloatingActionButton(
                onClick = onStartVoiceInput,
                containerColor = if (isVoiceListening) Color(0xFFFF5252) else MaterialTheme.colorScheme.primary,
                contentColor = Color.White,
                modifier = Modifier.testTag("voice_mic_button")
            ) {
                Icon(
                    imageVector = Icons.Default.Mic,
                    contentDescription = "Голосовая команда"
                )
            }
        },
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp, vertical = 12.dp)
        ) {
            // 1. TOTAL SUMMARY CARD (Always visible at top!)
            TotalSummaryCard(
                grandTotal = grandTotal,
                profit = totalProfit,
                debtors = totalDebtors,
                expenses = totalExpenses,
                currencyFormat = currencyFormat
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Update availability notice banner if available
            if (updateState is UpdateState.UpdateAvailable) {
                val state = updateState as UpdateState.UpdateAvailable
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { showUpdateDialog = true }
                        .padding(bottom = 8.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.SystemUpdate,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Есть обновление ${state.latestVersion}",
                                fontWeight = FontWeight.Bold,
                                style = MaterialTheme.typography.bodyMedium
                            )
                            Text(
                                text = "Нажмите, чтобы обновить приложение",
                                style = MaterialTheme.typography.bodySmall
                            )
                        }
                        Button(
                            onClick = { showUpdateDialog = true },
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                        ) {
                            Text("Обновить")
                        }
                    }
                }
            }

            // FIND DEBTOR BUTTON
            Button(
                onClick = { showDebtorSearchDialog = true },
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.secondaryContainer,
                    contentColor = MaterialTheme.colorScheme.onSecondaryContainer
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("find_debtor_button")
            ) {
                Icon(imageVector = Icons.Default.PersonSearch, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Найти должника", fontWeight = FontWeight.Bold)
            }

            Spacer(modifier = Modifier.height(12.dp))

            // 2. THREE MAIN ACTION BUTTONS: «Прибыль», «Траты», «Должники»
            Text(
                text = "Быстрый ввод",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.padding(vertical = 4.dp)
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Button 1: Прибыль
                ActionButtonItem(
                    title = "Прибыль",
                    icon = Icons.Default.TrendingUp,
                    color = Color(0xFF2E7D32),
                    modifier = Modifier
                        .weight(1f)
                        .testTag("action_profit_button"),
                    onClick = { activeDialogType = TransactionType.PROFIT }
                )

                // Button 2: Траты
                ActionButtonItem(
                    title = "Траты",
                    icon = Icons.Default.MoneyOff,
                    color = Color(0xFFC62828),
                    modifier = Modifier
                        .weight(1f)
                        .testTag("action_expense_button"),
                    onClick = { activeDialogType = TransactionType.EXPENSE }
                )

                // Button 3: Должники
                ActionButtonItem(
                    title = "Должники",
                    icon = Icons.Default.Add,
                    color = Color(0xFFEF6C00),
                    modifier = Modifier
                        .weight(1f)
                        .testTag("action_debtor_button"),
                    onClick = { activeDialogType = TransactionType.DEBTOR }
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 3. RECENT TRANSACTIONS LIST
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Все записи (${transactions.size})",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )

                OutlinedButton(onClick = onOpenReport) {
                    Text("Подробный отчёт")
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            if (transactions.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Записей пока нет.\nНажмите на кнопку выше или воспользуйтесь голосовой командой.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                }
            } else {
                LazyColumn(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(transactions, key = { it.id }) { item ->
                        TransactionItemCard(
                            item = item,
                            currencyFormat = currencyFormat,
                            onEdit = { editingTransaction = item },
                            onDelete = { viewModel.deleteTransaction(item) },
                            onMarkPaid = { viewModel.markDebtorAsPaid(item) }
                        )
                    }
                }
            }
        }
    }

    // Dialogs
    activeDialogType?.let { type ->
        AddEditTransactionDialog(
            type = type,
            onDismiss = { activeDialogType = null },
            onSave = { amount, note, clientInfo ->
                viewModel.addTransaction(type, amount, note, clientInfo)
                activeDialogType = null
            }
        )
    }

    editingTransaction?.let { item ->
        AddEditTransactionDialog(
            type = item.type,
            existingTransaction = item,
            onDismiss = { editingTransaction = null },
            onSave = { amount, note, clientInfo ->
                viewModel.updateTransaction(
                    item.copy(
                        amount = amount,
                        note = note,
                        clientInfo = clientInfo
                    )
                )
                editingTransaction = null
            }
        )
    }

    if (showDebtorSearchDialog) {
        val debtorSummaries by viewModel.debtorSummaries.collectAsStateWithLifecycle()
        DebtorSearchDialog(
            debtorSummaries = debtorSummaries,
            onDismiss = { showDebtorSearchDialog = false },
            onWriteOff = { clientName, amount, onError ->
                viewModel.writeOffDebtor(clientName, amount) { success, msg ->
                    if (success) {
                        showDebtorSearchDialog = false
                    } else {
                        onError(msg)
                    }
                }
            }
        )
    }

    if (showUpdateDialog) {
        UpdateStatusDialog(
            updateState = updateState,
            onDismiss = { showUpdateDialog = false },
            onCheckUpdate = { viewModel.triggerUpdateCheck() },
            onStartDownload = { downloadUrl -> viewModel.startApkDownload(downloadUrl) }
        )
    }
}

@Composable
fun TotalSummaryCard(
    grandTotal: Double,
    profit: Double,
    debtors: Double,
    expenses: Double,
    currencyFormat: NumberFormat
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "Общий итог",
                style = MaterialTheme.typography.titleSmall,
                color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f)
            )

            Text(
                text = currencyFormat.format(grandTotal),
                style = MaterialTheme.typography.headlineLarge.copy(
                    fontWeight = FontWeight.Bold,
                    fontSize = 32.sp
                ),
                color = if (grandTotal >= 0) Color(0xFF1B5E20) else Color(0xFFB71C1C)
            )

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                SummarySubItem(
                    title = "Прибыль",
                    value = currencyFormat.format(profit),
                    color = Color(0xFF2E7D32)
                )
                SummarySubItem(
                    title = "Должники",
                    value = currencyFormat.format(debtors),
                    color = Color(0xFFE65100)
                )
                SummarySubItem(
                    title = "Траты",
                    value = currencyFormat.format(expenses),
                    color = Color(0xFFC62828)
                )
            }
        }
    }
}

@Composable
fun SummarySubItem(title: String, value: String, color: Color) {
    Column {
        Text(
            text = title,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
            color = color
        )
    }
}

@Composable
fun ActionButtonItem(
    title: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    color: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Surface(
        onClick = onClick,
        modifier = modifier.height(80.dp),
        shape = RoundedCornerShape(12.dp),
        color = color.copy(alpha = 0.12f)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(8.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .clip(CircleShape)
                    .background(color),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = title,
                    tint = Color.White,
                    modifier = Modifier.size(20.dp)
                )
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = title,
                style = MaterialTheme.typography.bodyMedium.copy(
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp
                ),
                color = color
            )
        }
    }
}

@Composable
fun TransactionItemCard(
    item: TransactionEntity,
    currencyFormat: NumberFormat,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    onMarkPaid: () -> Unit
) {
    val dateFormat = remember { SimpleDateFormat("dd.MM.yyyy HH:mm", Locale("ru")) }

    val (typeColor, typeName) = when (item.type) {
        TransactionType.PROFIT -> Color(0xFF2E7D32) to "Прибыль"
        TransactionType.EXPENSE -> Color(0xFFC62828) to "Трата"
        TransactionType.DEBTOR -> Color(0xFFE65100) to "Должник"
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .clip(CircleShape)
                            .background(typeColor)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = typeName,
                        style = MaterialTheme.typography.labelLarge,
                        color = typeColor,
                        fontWeight = FontWeight.Bold
                    )
                }

                Text(
                    text = dateFormat.format(Date(item.date)),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Spacer(modifier = Modifier.height(4.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = item.note.ifBlank { "Без описания" },
                        style = MaterialTheme.typography.bodyLarge,
                        fontWeight = FontWeight.Medium
                    )

                    if (item.clientInfo.isNotBlank()) {
                        Text(
                            text = item.clientInfo,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                Text(
                    text = (if (item.type == TransactionType.EXPENSE) "- " else "+ ") + currencyFormat.format(item.amount),
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                    color = typeColor
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Action Buttons for single item
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (item.type == TransactionType.DEBTOR) {
                    Button(
                        onClick = onMarkPaid,
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2E7D32)),
                        modifier = Modifier
                            .padding(end = 8.dp)
                            .testTag("item_mark_paid_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Должник оплатил")
                    }
                }

                IconButton(
                    onClick = onEdit,
                    modifier = Modifier.size(36.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Edit,
                        contentDescription = "Редактировать",
                        modifier = Modifier.size(20.dp)
                    )
                }

                IconButton(
                    onClick = onDelete,
                    modifier = Modifier.size(36.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Delete,
                        contentDescription = "Удалить",
                        tint = Color.Gray,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }
    }
}
