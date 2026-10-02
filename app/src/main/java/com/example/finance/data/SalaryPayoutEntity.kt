package com.example.finance.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "salary_payouts")
data class SalaryPayoutEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val employeeId: Long,
    val employeeName: String,
    val amount: Double,
    val date: Long = System.currentTimeMillis()
)
