package com.example.finance.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.PersonSearch
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import java.text.NumberFormat
import java.util.Locale

@Composable
fun DebtorSearchDialog(
    debtorSummaries: List<DebtorSummaryGroup>,
    onDismiss: () -> Unit,
    onWriteOff: (clientName: String, amount: Double, onError: (String) -> Unit) -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedDebtor by remember { mutableStateOf<DebtorSummaryGroup?>(null) }

    val currencyFormat = remember { NumberFormat.getCurrencyInstance(Locale("ru", "RU")).apply { maximumFractionDigits = 0 } }

    val filteredDebtors = remember(searchQuery, debtorSummaries) {
        if (searchQuery.isBlank()) {
            debtorSummaries
        } else {
            debtorSummaries.filter {
                it.name.contains(searchQuery, ignoreCase = true)
            }
        }
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                if (selectedDebtor != null) {
                    IconButton(
                        onClick = { selectedDebtor = null },
                        modifier = Modifier.testTag("debtor_card_back_button")
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Назад к списку"
                        )
                    }
                } else {
                    Icon(
                        imageVector = Icons.Default.PersonSearch,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.padding(start = 8.dp))
                }
                Text(
                    text = if (selectedDebtor == null) "Поиск должников" else "Карточка должника",
                    fontWeight = FontWeight.Bold
                )
            }
        },
        text = {
            Column(modifier = Modifier.fillMaxWidth()) {
                if (selectedDebtor == null) {
                    // STEP 1: Search Field + Results List
                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = { searchQuery = it },
                        label = { Text("Имя должника") },
                        placeholder = { Text("Введите имя или авто...") },
                        leadingIcon = {
                            Icon(imageVector = Icons.Default.Search, contentDescription = null)
                        },
                        trailingIcon = {
                            if (searchQuery.isNotEmpty()) {
                                IconButton(onClick = { searchQuery = "" }) {
                                    Icon(imageVector = Icons.Default.Clear, contentDescription = "Очистить")
                                }
                            }
                        },
                        singleLine = true,
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("debtor_search_input")
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    if (filteredDebtors.isEmpty()) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(120.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = if (debtorSummaries.isEmpty()) "Список должников пуст" else "Должники по запросу «$searchQuery» не найдены",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    } else {
                        LazyColumn(
                            modifier = Modifier
                                .fillMaxWidth()
                                .heightIn(max = 280.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            items(filteredDebtors, key = { it.name }) { debtor ->
                                Card(
                                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable { selectedDebtor = debtor }
                                        .testTag("debtor_item_${debtor.name}")
                                ) {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(12.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column(modifier = Modifier.weight(1f)) {
                                            Text(
                                                text = debtor.name,
                                                fontWeight = FontWeight.Bold,
                                                style = MaterialTheme.typography.bodyLarge
                                            )
                                            Text(
                                                text = "Записей: ${debtor.transactions.size}",
                                                style = MaterialTheme.typography.bodySmall,
                                                color = MaterialTheme.colorScheme.onSurfaceVariant
                                            )
                                        }

                                        Text(
                                            text = currencyFormat.format(debtor.totalDebt),
                                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                            color = Color(0xFFE65100)
                                        )
                                    }
                                }
                            }
                        }
                    }
                } else {
                    // STEP 2: Selected Debtor Card with Write-Off Input
                    val debtor = selectedDebtor!!
                    var writeOffText by remember { mutableStateOf("") }
                    var errorMessage by remember { mutableStateOf<String?>(null) }

                    Column {
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = Color(0xFFEF6C00).copy(alpha = 0.12f),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text(
                                    text = debtor.name,
                                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                    color = Color(0xFFE65100)
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text("Текущий долг:", style = MaterialTheme.typography.bodyMedium)
                                    Text(
                                        text = currencyFormat.format(debtor.totalDebt),
                                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                        color = Color(0xFFE65100)
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        OutlinedTextField(
                            value = writeOffText,
                            onValueChange = {
                                writeOffText = it
                                errorMessage = null
                            },
                            label = { Text("Сумма списания (₽)") },
                            placeholder = { Text("До ${debtor.totalDebt.toInt()} ₽") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            isError = errorMessage != null,
                            singleLine = true,
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("write_off_amount_input")
                        )

                        if (errorMessage != null) {
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = errorMessage!!,
                                color = MaterialTheme.colorScheme.error,
                                style = MaterialTheme.typography.bodySmall
                            )
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        Button(
                            onClick = {
                                val amount = writeOffText.replace(",", ".").toDoubleOrNull()
                                if (amount == null || amount <= 0) {
                                    errorMessage = "Введите положительную сумму для списания"
                                } else if (amount > debtor.totalDebt) {
                                    errorMessage = "Нельзя списать больше текущего долга (${currencyFormat.format(debtor.totalDebt)})"
                                } else {
                                    onWriteOff(debtor.name, amount) { err ->
                                        errorMessage = err
                                    }
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2E7D32)),
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("execute_write_off_button")
                        ) {
                            Text("Списать долг")
                        }
                    }
                }
            }
        },
        confirmButton = {},
        dismissButton = {
            TextButton(
                onClick = onDismiss,
                modifier = Modifier.testTag("debtor_search_close_button")
            ) {
                Text("Закрыть")
            }
        }
    )
}
