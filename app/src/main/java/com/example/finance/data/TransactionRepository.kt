package com.example.finance.data

import kotlinx.coroutines.flow.Flow

class TransactionRepository(private val dao: TransactionDao) {

    val allTransactions: Flow<List<TransactionEntity>> = dao.getAllTransactions()

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
}
