package com.example.finance.voice

import com.example.finance.data.TransactionType
import java.util.Locale

sealed class VoiceCommand {
    data class AddTransaction(
        val type: TransactionType,
        val amount: Double,
        val note: String,
        val clientInfo: String
    ) : VoiceCommand()

    object NavigateReport : VoiceCommand()
    object NavigateMain : VoiceCommand()
    object NavigateBack : VoiceCommand()
    object DeleteLast : VoiceCommand()
    object CheckUpdate : VoiceCommand()
    data class Unknown(val rawText: String) : VoiceCommand()
}

object VoiceParser {

    fun parseCommand(rawText: String): VoiceCommand {
        val text = rawText.lowercase(Locale("ru")).trim()
        if (text.isEmpty()) return VoiceCommand.Unknown(rawText)

        // Navigation & Control Commands
        if (text.contains("отчёт") || text.contains("отчет")) {
            return VoiceCommand.NavigateReport
        }
        if (text.contains("главная") || text.contains("домой") || text.contains("на главную")) {
            return VoiceCommand.NavigateMain
        }
        if (text == "назад" || text.contains("вернись") || text.contains("страница назад")) {
            return VoiceCommand.NavigateBack
        }
        if (text.contains("удали последнее") || text.contains("удалить последнее") || text.contains("стереть последнее")) {
            return VoiceCommand.DeleteLast
        }
        if (text.contains("обнови") || text.contains("проверь обновления") || text.contains("проверить обновления") || text.contains("обновление")) {
            return VoiceCommand.CheckUpdate
        }

        // Transaction addition keywords
        val isProfit = text.contains("прибыль") || text.contains("доход") || text.contains("оплата") || text.contains("заработок")
        val isExpense = text.contains("трата") || text.contains("траты") || text.contains("расход") || text.contains("расходы") || text.contains("покупка")
        val isDebtor = text.contains("должник") || text.contains("долг") || text.contains("должники") || text.contains("в долг")

        if (isProfit || isExpense || isDebtor) {
            val type = when {
                isDebtor -> TransactionType.DEBTOR
                isExpense -> TransactionType.EXPENSE
                else -> TransactionType.PROFIT
            }

            val parseResult = extractAmountAndRemainder(text)
            val amount = parseResult.first
            var remainder = parseResult.second

            // Clean up keyword words from remainder
            remainder = remainder
                .replace("прибыль", "")
                .replace("доход", "")
                .replace("трата", "")
                .replace("траты", "")
                .replace("расход", "")
                .replace("расходы", "")
                .replace("должник", "")
                .replace("должники", "")
                .replace("долг", "")
                .replace("  ", " ")
                .trim()

            if (amount > 0) {
                var clientInfo = ""
                var note = remainder

                // For debtors or entries, split potential client info vs work note if possible
                if (type == TransactionType.DEBTOR) {
                    // Try to extract client name / car if present
                    val parts = remainder.split(" ", limit = 3)
                    if (parts.size >= 2) {
                        clientInfo = "${parts[0]} ${parts[1]}".trim()
                        note = if (parts.size > 2) parts[2] else remainder
                    } else {
                        clientInfo = remainder
                    }
                } else {
                    // Check if car brand or client is mentioned
                    val words = remainder.split(" ")
                    if (words.size > 1 && (words.last().length > 2 && words.last()[0].isUpperCase())) {
                        clientInfo = words.last()
                        note = words.dropLast(1).joinToString(" ")
                    }
                }

                return VoiceCommand.AddTransaction(
                    type = type,
                    amount = amount,
                    note = note.ifBlank { "Голосовая запись" },
                    clientInfo = clientInfo
                )
            }
        }

        return VoiceCommand.Unknown(rawText)
    }

    /**
     * Extracts numerical amount (both digit-based and Russian word-based) from text
     * Returns Pair(Amount, RemainderText)
     */
    private fun extractAmountAndRemainder(text: String): Pair<Double, String> {
        // 1. Try digit extraction first (e.g. 3500, 12 000, 3,500)
        val digitRegex = Regex("""(\d+[\d\s.,]*\d|\d+)""")
        val digitMatch = digitRegex.find(text)
        if (digitMatch != null) {
            val rawNumStr = digitMatch.value.replace(" ", "").replace(",", ".")
            val parsedDouble = rawNumStr.toDoubleOrNull()
            if (parsedDouble != null && parsedDouble > 0) {
                val remainder = text.removeRange(digitMatch.range).trim()
                return Pair(parsedDouble, remainder)
            }
        }

        // 2. Try Russian verbal number extraction
        val words = text.split(Regex("""\s+"""))
        val numberResult = parseRussianVerbalNumberInWords(words)
        if (numberResult.amount > 0) {
            val remainderWords = words.filterIndexed { index, _ -> index !in numberResult.usedIndices }
            return Pair(numberResult.amount, remainderWords.joinToString(" "))
        }

        return Pair(0.0, text)
    }

    private data class VerbalNumberResult(val amount: Double, val usedIndices: Set<Int>)

    private fun parseRussianVerbalNumberInWords(words: List<String>): VerbalNumberResult {
        val usedIndices = mutableSetOf<Int>()
        var totalAmount = 0.0
        var currentChunk = 0.0

        var i = 0
        while (i < words.size) {
            val w = words[i].lowercase().replace(".", "").replace(",", "")

            // Check phrase "с половиной"
            if (w == "с" && i + 1 < words.size && words[i + 1].lowercase() == "половиной") {
                usedIndices.add(i)
                usedIndices.add(i + 1)
                // Add 0.5 to preceding number if thousands, e.g., "две с половиной тысячи" -> (2 + 0.5) * 1000 = 2500
                if (currentChunk > 0) {
                    currentChunk += 0.5
                }
                i += 2
                continue
            }

            val numValue = wordToNumberMap[w]
            if (numValue != null) {
                usedIndices.add(i)
                currentChunk += numValue
                i++
                continue
            }

            val scaleValue = wordToScaleMap[w]
            if (scaleValue != null) {
                usedIndices.add(i)
                if (currentChunk == 0.0) currentChunk = 1.0
                totalAmount += currentChunk * scaleValue
                currentChunk = 0.0
                i++
                continue
            }

            // Special cases like "полтора", "полторы" = 1.5
            if (w == "полтора" || w == "полторы") {
                usedIndices.add(i)
                currentChunk += 1.5
                i++
                continue
            }

            i++
        }

        totalAmount += currentChunk
        return VerbalNumberResult(totalAmount, usedIndices)
    }

    private val wordToNumberMap = mapOf(
        "ноль" to 0.0,
        "один" to 1.0, "одна" to 1.0, "одно" to 1.0,
        "два" to 2.0, "две" to 2.0,
        "три" to 3.0,
        "четыре" to 4.0,
        "пять" to 5.0,
        "шесть" to 6.0,
        "семь" to 7.0,
        "восемь" to 8.0,
        "девять" to 9.0,
        "десять" to 10.0,
        "одиннадцать" to 11.0,
        "двенадцать" to 12.0,
        "тринадцать" to 13.0,
        "четырнадцать" to 14.0,
        "пятнадцать" to 15.0,
        "шестнадцать" to 16.0,
        "семнадцать" to 17.0,
        "восемнадцать" to 18.0,
        "девятнадцать" to 19.0,
        "двадцать" to 20.0,
        "тридцать" to 30.0,
        "сорок" to 40.0,
        "пятьдесят" to 50.0,
        "шестьдесят" to 60.0,
        "семьдесят" to 70.0,
        "восемьдесят" to 80.0,
        "девяносто" to 90.0,
        "сто" to 100.0,
        "двести" to 200.0,
        "триста" to 300.0,
        "четыреста" to 400.0,
        "пятьсот" to 500.0,
        "шестьсот" to 600.0,
        "семьсот" to 700.0,
        "восемьсот" to 800.0,
        "девятьсот" to 900.0
    )

    private val wordToScaleMap = mapOf(
        "тысяча" to 1000.0, "тысячи" to 1000.0, "тысяч" to 1000.0, "тыс" to 1000.0, "к" to 1000.0,
        "миллион" to 1000000.0, "миллиона" to 1000000.0, "миллионов" to 1000000.0, "млн" to 1000000.0
    )
}
