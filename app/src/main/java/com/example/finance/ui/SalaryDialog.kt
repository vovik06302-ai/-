package com.example.finance.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Badge
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.Payments
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.HorizontalDivider
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
import androidx.compose.ui.unit.sp
import com.example.finance.data.EmployeeEntity
import com.example.finance.data.SalaryPayoutEntity
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun SalaryDialog(
    employees: List<EmployeeEntity>,
    payouts: List<SalaryPayoutEntity>,
    onDismiss: () -> Unit,
    onAddEmployee: (name: String, salary: Double, onError: (String) -> Unit) -> Unit,
    onUpdateEmployee: (employee: EmployeeEntity, onError: (String) -> Unit) -> Unit,
    onDeleteEmployee: (employee: EmployeeEntity) -> Unit,
    onAddSalaryPayout: (employee: EmployeeEntity, amount: Double, onError: (String) -> Unit) -> Unit
) {
    var showAddEditEmployeeDialog by remember { mutableStateOf(false) }
    var editingEmployee by remember { mutableStateOf<EmployeeEntity?>(null) }

    val currencyFormat = remember { NumberFormat.getCurrencyInstance(Locale("ru", "RU")).apply { maximumFractionDigits = 0 } }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(
                    imageVector = Icons.Default.Badge,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Учёт зарплат",
                    fontWeight = FontWeight.Bold
                )
            }
        },
        text = {
            Column(modifier = Modifier.fillMaxWidth()) {
                // Button to Add New Employee
                Button(
                    onClick = {
                        editingEmployee = null
                        showAddEditEmployeeDialog = true
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("add_employee_button")
                ) {
                    Icon(imageVector = Icons.Default.Add, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Добавить сотрудника")
                }

                Spacer(modifier = Modifier.height(12.dp))

                if (employees.isEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(140.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "Список сотрудников пуст.\nНажмите «Добавить сотрудника», чтобы начать.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxWidth()
                            .heightIn(max = 360.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        items(employees, key = { it.id }) { employee ->
                            val employeePayouts = payouts.filter { it.employeeId == employee.id }
                            EmployeeItemCard(
                                employee = employee,
                                payouts = employeePayouts,
                                currencyFormat = currencyFormat,
                                onEdit = {
                                    editingEmployee = employee
                                    showAddEditEmployeeDialog = true
                                },
                                onDelete = { onDeleteEmployee(employee) },
                                onAddPayout = { amount, onError ->
                                    onAddSalaryPayout(employee, amount, onError)
                                }
                            )
                        }
                    }
                }
            }
        },
        confirmButton = {},
        dismissButton = {
            TextButton(
                onClick = onDismiss,
                modifier = Modifier.testTag("salary_dialog_close_button")
            ) {
                Text("Закрыть")
            }
        }
    )

    // Sub-dialog for adding/editing an employee
    if (showAddEditEmployeeDialog) {
        AddEditEmployeeSubDialog(
            existingEmployee = editingEmployee,
            onDismiss = { showAddEditEmployeeDialog = false },
            onSave = { name, salary, onError ->
                if (editingEmployee == null) {
                    onAddEmployee(name, salary) { err -> onError(err) }
                } else {
                    onUpdateEmployee(editingEmployee!!.copy(name = name, salary = salary)) { err -> onError(err) }
                }
                showAddEditEmployeeDialog = false
            }
        )
    }
}

@Composable
fun EmployeeItemCard(
    employee: EmployeeEntity,
    payouts: List<SalaryPayoutEntity>,
    currencyFormat: NumberFormat,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    onAddPayout: (amount: Double, onError: (String) -> Unit) -> Unit
) {
    var payoutInputText by remember { mutableStateOf("") }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var showPayoutHistory by remember { mutableStateOf(false) }

    val dateFormat = remember { SimpleDateFormat("dd.MM.yyyy HH:mm", Locale("ru")) }
    val totalPaid = payouts.sumOf { it.amount }
    val remaining = employee.salary - totalPaid

    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            // Header Row: Employee Name + Actions
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = employee.name,
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    modifier = Modifier.weight(1f)
                )

                Row {
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

            Spacer(modifier = Modifier.height(4.dp))

            // Salary Details
            Column(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "Месячная зарплата: ${currencyFormat.format(employee.salary)}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = "Выдано всего: ${currencyFormat.format(totalPaid)}",
                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                    color = Color(0xFF2E7D32)
                )
                Text(
                    text = "Остаток к выплате: ${currencyFormat.format(if (remaining < 0) 0.0 else remaining)}",
                    style = MaterialTheme.typography.bodyMedium.copy(
                        fontWeight = FontWeight.Bold,
                        color = if (remaining > 0) Color(0xFFC62828) else Color(0xFF2E7D32)
                    )
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Payout History Expandable Toggle Button
            if (payouts.isNotEmpty()) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 2.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "История выплат (${payouts.size}):",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold
                    )
                    TextButton(
                        onClick = { showPayoutHistory = !showPayoutHistory },
                        modifier = Modifier.height(28.dp)
                    ) {
                        Text(
                            text = if (showPayoutHistory) "Скрыть" else "Показать",
                            fontSize = 12.sp
                        )
                        Icon(
                            imageVector = if (showPayoutHistory) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }

                AnimatedVisibility(visible = showPayoutHistory) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        payouts.forEach { payout ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(
                                        MaterialTheme.colorScheme.surface.copy(alpha = 0.6f),
                                        shape = RoundedCornerShape(6.dp)
                                    )
                                    .padding(horizontal = 8.dp, vertical = 4.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = dateFormat.format(Date(payout.date)),
                                    style = MaterialTheme.typography.bodySmall,
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = currencyFormat.format(payout.amount),
                                    style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold),
                                    color = Color(0xFFC62828)
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Add Payout Input & Button
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedTextField(
                    value = payoutInputText,
                    onValueChange = {
                        payoutInputText = it
                        errorMessage = null
                    },
                    label = { Text("Сумма выплаты") },
                    placeholder = { Text("10000") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    singleLine = true,
                    isError = errorMessage != null,
                    modifier = Modifier
                        .weight(1f)
                        .testTag("payout_amount_input_${employee.id}")
                )

                Button(
                    onClick = {
                        val amount = payoutInputText.replace(",", ".").toDoubleOrNull()
                        if (amount == null || amount <= 0) {
                            errorMessage = "Введите сумму больше 0"
                        } else {
                            onAddPayout(amount) { err ->
                                errorMessage = err
                            }
                            payoutInputText = ""
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFC62828)),
                    modifier = Modifier
                        .height(56.dp)
                        .testTag("add_payout_button_${employee.id}")
                ) {
                    Text("Добавить\nвыплату", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }

            if (errorMessage != null) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = errorMessage!!,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall
                )
            }
        }
    }
}

@Composable
fun AddEditEmployeeSubDialog(
    existingEmployee: EmployeeEntity? = null,
    onDismiss: () -> Unit,
    onSave: (name: String, salary: Double, onError: (String) -> Unit) -> Unit
) {
    var nameText by remember { mutableStateOf(existingEmployee?.name ?: "") }
    var salaryText by remember {
        mutableStateOf(existingEmployee?.salary?.let {
            if (it % 1.0 == 0.0) it.toLong().toString() else it.toString()
        } ?: "")
    }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = if (existingEmployee == null) "Добавить сотрудника" else "Редактировать сотрудника",
                fontWeight = FontWeight.Bold
            )
        },
        text = {
            Column {
                OutlinedTextField(
                    value = nameText,
                    onValueChange = {
                        nameText = it
                        errorMessage = null
                    },
                    label = { Text("Имя сотрудника") },
                    placeholder = { Text("Иван Иванов") },
                    singleLine = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("employee_name_input")
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = salaryText,
                    onValueChange = {
                        salaryText = it
                        errorMessage = null
                    },
                    label = { Text("Месячная зарплата (₽)") },
                    placeholder = { Text("50000") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    singleLine = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("employee_salary_input")
                )

                if (errorMessage != null) {
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = errorMessage!!,
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodySmall
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val name = nameText.trim()
                    val salary = salaryText.replace(",", ".").toDoubleOrNull()

                    if (name.isBlank()) {
                        errorMessage = "Имя сотрудника не может быть пустым"
                    } else if (salary == null || salary <= 0) {
                        errorMessage = "Введите корректную сумму зарплаты (больше 0 ₽)"
                    } else {
                        onSave(name, salary) { err ->
                            errorMessage = err
                        }
                    }
                },
                modifier = Modifier.testTag("save_employee_button")
            ) {
                Text("Сохранить")
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss,
                modifier = Modifier.testTag("cancel_employee_button")
            ) {
                Text("Отмена")
            }
        }
    )
}
