package com.example.finance.data

import kotlinx.coroutines.flow.Flow

class TransactionRepository(
    private val dao: TransactionDao,
    private val employeeDao: EmployeeDao,
    private val salaryPayoutDao: SalaryPayoutDao
) {

    val allTransactions: Flow<List<TransactionEntity>> = dao.getAllTransactions()
    val allEmployees: Flow<List<EmployeeEntity>> = employeeDao.getAllEmployees()
    val allSalaryPayouts: Flow<List<SalaryPayoutEntity>> = salaryPayoutDao.getAllSalaryPayouts()

    suspend fun insert(transaction: TransactionEntity): Long {
        return dao.insertTransaction(transaction)
    }

    suspend fun update(transaction: TransactionEntity) {
        dao.updateTransaction(transaction)
    }

    suspend fun delete(transaction: TransactionEntity) {
        dao.deleteTransaction(transaction)
    }

    suspend fun deleteById(id: Long) {
        dao.deleteTransactionById(id)
    }

    suspend fun deleteLast(): Boolean {
        val last = dao.getLastTransaction() ?: return false
        dao.deleteTransaction(last)
        return true
    }

    suspend fun markDebtorPaid(transaction: TransactionEntity) {
        if (transaction.type == TransactionType.DEBTOR) {
            val updated = transaction.copy(
                type = TransactionType.PROFIT,
                note = "Списание долга: ${transaction.note.ifBlank { "Долг" }}",
                date = System.currentTimeMillis()
            )
            dao.updateTransaction(updated)
        }
    }

    suspend fun writeOffDebtor(clientName: String, writeOffAmount: Double): Double {
        val allDebtors = dao.getAllDebtorsList()
        val clientDebtors = allDebtors.filter {
            val name = it.clientInfo.ifBlank { it.note }
            name.equals(clientName, ignoreCase = true) || it.clientInfo.contains(clientName, ignoreCase = true)
        }

        var remainingToDeduct = writeOffAmount
        var totalDeducted = 0.0

        for (tx in clientDebtors) {
            if (remainingToDeduct <= 0) break

            if (tx.amount <= remainingToDeduct) {
                val amountDeducted = tx.amount
                remainingToDeduct -= amountDeducted
                totalDeducted += amountDeducted

                val updatedTx = tx.copy(
                    type = TransactionType.PROFIT,
                    note = "Списание долга: ${tx.note.ifBlank { "Долг" }}",
                    date = System.currentTimeMillis()
                )
                dao.updateTransaction(updatedTx)
            } else {
                val amountDeducted = remainingToDeduct
                val newDebtorAmount = tx.amount - remainingToDeduct
                remainingToDeduct = 0.0
                totalDeducted += amountDeducted

                val updatedDebtorTx = tx.copy(amount = newDebtorAmount)
                dao.updateTransaction(updatedDebtorTx)

                val historyTx = TransactionEntity(
                    type = TransactionType.PROFIT,
                    amount = amountDeducted,
                    note = "Частичное списание долга (${tx.note.ifBlank { "Долг" }})",
                    clientInfo = tx.clientInfo.ifBlank { clientName },
                    date = System.currentTimeMillis()
                )
                dao.insertTransaction(historyTx)
            }
        }

        return totalDeducted
    }

    // Employee Management Methods
    suspend fun insertEmployee(employee: EmployeeEntity): Long {
        return employeeDao.insertEmployee(employee)
    }

    suspend fun updateEmployee(employee: EmployeeEntity) {
        employeeDao.updateEmployee(employee)
    }

    suspend fun deleteEmployee(employee: EmployeeEntity) {
        employeeDao.deleteEmployee(employee)
    }

    // Salary Payout Methods
    fun getPayoutsForEmployee(employeeId: Long): Flow<List<SalaryPayoutEntity>> {
        return salaryPayoutDao.getPayoutsForEmployee(employeeId)
    }

    suspend fun addSalaryPayout(employeeId: Long, employeeName: String, amount: Double): Long {
        val now = System.currentTimeMillis()
        val payout = SalaryPayoutEntity(
            employeeId = employeeId,
            employeeName = employeeName,
            amount = amount,
            date = now
        )
        val payoutId = salaryPayoutDao.insertPayout(payout)

        // Also record as expense in main finance history
        val salaryExpense = TransactionEntity(
            type = TransactionType.EXPENSE,
            amount = amount,
            note = "Выплата зарплаты: $employeeName",
            clientInfo = employeeName,
            date = now
        )
        dao.insertTransaction(salaryExpense)

        return payoutId
    }
}
