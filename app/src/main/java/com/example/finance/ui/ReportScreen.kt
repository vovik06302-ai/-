package com.example.finance.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.FileDownload
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.finance.data.CsvExporter
import com.example.finance.data.TransactionEntity
import com.example.finance.data.TransactionType
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReportScreen(
    viewModel: MainViewModel,
    onNavigateBack: () -> Unit
) {
    BackHandler { onNavigateBack() }

    val context = LocalContext.current
    val transactions by viewModel.filteredTransactions.collectAsStateWithLifecycle()
    val selectedFilter by viewModel.selectedFilter.collectAsStateWithLifecycle()

    val currencyFormat = remember { NumberFormat.getCurrencyInstance(Locale("ru", "RU")).apply { maximumFractionDigits = 0 } }

    val profitItems = transactions.filter { it.type == TransactionType.PROFIT }
    val debtorItems = transactions.filter { it.type == TransactionType.DEBTOR }
    val expenseItems = transactions.filter { it.type == TransactionType.EXPENSE }

    val profitSum = profitItems.sumOf { it.amount }
    val debtorsSum = debtorItems.sumOf { it.amount }
    val expensesSum = expenseItems.sumOf { it.amount }
    val grandTotal = profitSum + debtorsSum - expensesSum

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Финансовый отчёт") },
                navigationIcon = {
                    IconButton(
                        onClick = onNavigateBack,
                        modifier = Modifier.testTag("report_back_button")
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Назад"
                        )
                    }
                },
                actions = {
                    IconButton(
                        onClick = {
                            CsvExporter.exportAndShareCsv(
                                context = context,
                                transactions = transactions,
                                filterName = selectedFilter.label
                            )
                        },
                        modifier = Modifier.testTag("export_csv_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.FileDownload,
                            contentDescription = "Экспорт в CSV"
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp, vertical = 8.dp)
        ) {
            // FILTER PERIOD SELECTION
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FilterPeriod.values().forEach { period ->
                    FilterChip(
                        selected = selectedFilter == period,
                        onClick = { viewModel.setFilterPeriod(period) },
                        label = { Text(period.label) },
                        modifier = Modifier.testTag("filter_chip_${period.name.lowercase()}")
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // 1. PROFIT ROW (Показывается раздельно, отдельной строкой)
                item {
                    ReportSummaryRowCard(
                        title = "Прибыль (Оплачено)",
                        amount = profitSum,
                        color = Color(0xFF2E7D32),
                        currencyFormat = currencyFormat,
                        itemCount = profitItems.size
                    )
                }

                // 2. DEBTORS ROW + LIST BELOW
                item {
                    ReportSummaryRowCard(
                        title = "Должники (Не оплачено)",
                        amount = debtorsSum,
                        color = Color(0xFFE65100),
                        currencyFormat = currencyFormat,
                        itemCount = debtorItems.size
                    )
                }

                if (debtorItems.isNotEmpty()) {
                    item {
                        Text(
                            text = "Список должников (Кто, авто, за что, сколько):",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFE65100),
                            modifier = Modifier.padding(top = 4.dp, bottom = 2.dp)
                        )
                    }

                    items(debtorItems, key = { "debtor_${it.id}" }) { debtor ->
                        DebtorDetailCard(
                            debtor = debtor,
                            currencyFormat = currencyFormat,
                            onMarkPaid = { viewModel.markDebtorAsPaid(debtor) }
                        )
                    }
                }

                // 3. EXPENSES ROW
                item {
                    ReportSummaryRowCard(
                        title = "Траты (Расходы)",
                        amount = expensesSum,
                        color = Color(0xFFC62828),
                        currencyFormat = currencyFormat,
                        itemCount = expenseItems.size
                    )
                }

                // 4. GRAND TOTAL SUMMARY CARD
                item {
                    Card(
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.primaryContainer
                        ),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = "ОБЩИЙ ИТОГ (Прибыль + Должники − Траты)",
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = currencyFormat.format(grandTotal),
                                style = MaterialTheme.typography.headlineMedium.copy(
                                    fontWeight = FontWeight.Bold
                                ),
                                color = if (grandTotal >= 0) Color(0xFF1B5E20) else Color(0xFFB71C1C)
                            )
                        }
                    }
                }

                // CSV EXPORT BUTTON AT BOTTOM
                item {
                    Button(
                        onClick = {
                            CsvExporter.exportAndShareCsv(
                                context = context,
                                transactions = transactions,
                                filterName = selectedFilter.label
                            )
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 12.dp)
                            .testTag("export_csv_full_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.FileDownload,
                            contentDescription = null
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Экспортировать отчёт в CSV")
                    }
                }
            }
        }
    }
}

@Composable
fun ReportSummaryRowCard(
    title: String,
    amount: Double,
    color: Color,
    currencyFormat: NumberFormat,
    itemCount: Int
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = color.copy(alpha = 0.1f)),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = color
                )
                Text(
                    text = "Записей: $itemCount",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Text(
                text = currencyFormat.format(amount),
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                color = color
            )
        }
    }
}

@Composable
fun DebtorDetailCard(
    debtor: TransactionEntity,
    currencyFormat: NumberFormat,
    onMarkPaid: () -> Unit
) {
    val dateFormat = remember { SimpleDateFormat("dd.MM.yyyy HH:mm", Locale("ru")) }

    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = debtor.clientInfo.ifBlank { "Клиент не указан" },
                    style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Bold),
                    color = Color(0xFFE65100)
                )

                Text(
                    text = currencyFormat.format(debtor.amount),
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = Color(0xFFE65100)
                )
            }

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = "За что: ${debtor.note.ifBlank { "Замена деталей / услуга" }}",
                style = MaterialTheme.typography.bodyMedium
            )

            Spacer(modifier = Modifier.height(4.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Дата: ${dateFormat.format(Date(debtor.date))}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                OutlinedButton(
                    onClick = onMarkPaid,
                    modifier = Modifier.testTag("debtor_pay_button_${debtor.id}")
                ) {
                    Text("Должник оплатил")
                }
            }
        }
    }
}
