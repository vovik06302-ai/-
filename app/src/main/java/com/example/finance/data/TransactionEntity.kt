package com.example.finance.data

import androidx.room.Entity
import androidx.room.PrimaryKey

enum class TransactionType {
    PROFIT,   // Прибыль (оплаченные работы)
    EXPENSE,  // Траты (запчасти, аренда, зарплаты и т. д.)
    DEBTOR    // Должники (клиенты, которые ещё не расплатились)
}

@Entity(tableName = "transactions")
data class TransactionEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val type: TransactionType,
    val amount: Double,
    val note: String,          // Работа / заметка / за что
    val clientInfo: String = "",// Клиент, авто, номер
    val date: Long = System.currentTimeMillis()
)
