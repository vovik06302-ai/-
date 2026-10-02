package com.example.finance.ui

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.example.finance.data.TransactionEntity
import com.example.finance.data.TransactionType

@Composable
fun AddEditTransactionDialog(
    type: TransactionType,
    existingTransaction: TransactionEntity? = null,
    onDismiss: () -> Unit,
    onSave: (amount: Double, note: String, clientInfo: String) -> Unit
) {
    var amountText by remember {
        mutableStateOf(existingTransaction?.amount?.let {
            if (it % 1.0 == 0.0) it.toLong().toString() else it.toString()
        } ?: "")
    }
    var noteText by remember { mutableStateOf(existingTransaction?.note ?: "") }
    var clientInfoText by remember { mutableStateOf(existingTransaction?.clientInfo ?: "") }
    var amountError by remember { mutableStateOf(false) }

    val title = when {
        existingTransaction != null -> "Редактировать запись"
        type == TransactionType.PROFIT -> "Добавить прибыль"
        type == TransactionType.EXPENSE -> "Добавить трату"
        else -> "Добавить должника"
    }

    val noteLabel = when (type) {
        TransactionType.PROFIT -> "Работа / заметка"
        TransactionType.EXPENSE -> "Описание / заметка"
        TransactionType.DEBTOR -> "Работа / за что"
    }

    val clientLabel = when (type) {
        TransactionType.PROFIT -> "Авто / номер"
        TransactionType.EXPENSE -> "Детали / инфо (необязательно)"
        TransactionType.DEBTOR -> "Клиент, авто, номер"
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(text = title) },
        text = {
            Column {
                OutlinedTextField(
                    value = amountText,
                    onValueChange = {
                        amountText = it
                        amountError = false
                    },
                    label = { Text("Сумма (₽)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    isError = amountError,
                    singleLine = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("dialog_amount_input")
                )
                if (amountError) {
                    Text(
                        text = "Введите корректную сумму",
                        color = androidx.compose.material3.MaterialTheme.colorScheme.error,
                        style = androidx.compose.material3.MaterialTheme.typography.bodySmall
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = noteText,
                    onValueChange = { noteText = it },
                    label = { Text(noteLabel) },
                    singleLine = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("dialog_note_input")
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = clientInfoText,
                    onValueChange = { clientInfoText = it },
                    label = { Text(clientLabel) },
                    singleLine = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("dialog_client_input")
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val amount = amountText.replace(",", ".").toDoubleOrNull()
                    if (amount != null && amount > 0) {
                        onSave(amount, noteText.trim(), clientInfoText.trim())
                    } else {
                        amountError = true
                    }
                },
                modifier = Modifier.testTag("dialog_save_button")
            ) {
                Text("Сохранить")
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss,
                modifier = Modifier.testTag("dialog_cancel_button")
            ) {
                Text("Отмена")
            }
        }
    )
}
