package com.example.finance.data

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface SalaryPayoutDao {
    @Query("SELECT * FROM salary_payouts ORDER BY date DESC")
    fun getAllSalaryPayouts(): Flow<List<SalaryPayoutEntity>>

    @Query("SELECT * FROM salary_payouts WHERE employeeId = :employeeId ORDER BY date DESC")
    fun getPayoutsForEmployee(employeeId: Long): Flow<List<SalaryPayoutEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPayout(payout: SalaryPayoutEntity): Long

    @Delete
    suspend fun deletePayout(payout: SalaryPayoutEntity)
}
