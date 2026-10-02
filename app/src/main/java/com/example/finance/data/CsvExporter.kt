package com.example.finance.data

import android.content.Context
import android.content.Intent
import androidx.core.content.FileProvider
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object CsvExporter {

    fun exportAndShareCsv(context: Context, transactions: List<TransactionEntity>, filterName: String) {
        val dateFormat = SimpleDateFormat("dd.MM.yyyy HH:mm", Locale("ru"))
        val fileNameDate = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
        val fileName = "finance_report_$fileNameDate.csv"

        val file = File(context.cacheDir, fileName)
        val stringBuilder = StringBuilder()

        // CSV Header (UTF-8 with BOM for Excel compatibility)
        stringBuilder.append("\uFEFF") // UTF-8 BOM
        stringBuilder.append("ID;Дата;Тип;Сумма;Описание/Заметка;Клиент/Авто\n")

        for (item in transactions) {
            val dateStr = dateFormat.format(Date(item.date))
            val typeStr = when (item.type) {
                TransactionType.PROFIT -> "Прибыль"
                TransactionType.EXPENSE -> "Трата"
                TransactionType.DEBTOR -> "Должник"
            }
            val noteEscaped = item.note.replace(";", ",").replace("\n", " ")
            val clientEscaped = item.clientInfo.replace(";", ",").replace("\n", " ")

            stringBuilder.append("${item.id};$dateStr;$typeStr;${item.amount};$noteEscaped;$clientEscaped\n")
        }

        file.writeText(stringBuilder.toString(), Charsets.UTF_8)

        val uri = FileProvider.getUriForFile(
            context,
            "${context.packageName}.fileprovider",
            file
        )

        val shareIntent = Intent(Intent.ACTION_SEND).apply {
            type = "text/csv"
            putExtra(Intent.EXTRA_SUBJECT, "Финансовый отчёт ($filterName)")
            putExtra(Intent.EXTRA_STREAM, uri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }

        val chooser = Intent.createChooser(shareIntent, "Поделиться отчётом CSV")
        chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(chooser)
    }
}
