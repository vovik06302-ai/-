import { VoiceCommand, TransactionType } from './types';

const wordToNumberMap: Record<string, number> = {
  'ноль': 0,
  'один': 1, 'одна': 1, 'одно': 1,
  'два': 2, 'две': 2,
  'три': 3,
  'четыре': 4,
  'пять': 5,
  'шесть': 6,
  'семь': 7,
  'восемь': 8,
  'девять': 9,
  'десять': 10,
  'одиннадцать': 11,
  'двенадцать': 12,
  'тринадцать': 13,
  'четырнадцать': 14,
  'пятнадцать': 15,
  'шестнадцать': 16,
  'семнадцать': 17,
  'восемнадцать': 18,
  'девятнадцать': 19,
  'двадцать': 20,
  'тридцать': 30,
  'сорок': 40,
  'пятьдесят': 50,
  'шестьдесят': 60,
  'семьдесят': 70,
  'восемьдесят': 80,
  'девяносто': 90,
  'сто': 100,
  'двести': 200,
  'триста': 300,
  'четыреста': 400,
  'пятьсот': 500,
  'шестьсот': 600,
  'семьсот': 700,
  'восемьсот': 800,
  'девятьсот': 900
};

const wordToScaleMap: Record<string, number> = {
  'тысяча': 1000, 'тысячи': 1000, 'тысяч': 1000, 'тыс': 1000, 'к': 1000,
  'миллион': 1000000, 'миллиона': 1000000, 'миллионов': 1000000, 'млн': 1000000
};

function parseRussianVerbalNumberInWords(words: string[]): { amount: number; usedIndices: Set<number> } {
  const usedIndices = new Set<number>();
  let totalAmount = 0;
  let currentChunk = 0;

  let i = 0;
  while (i < words.length) {
    const w = words[i].toLowerCase().replace(/[.,]/g, '');

    // Check "с половиной"
    if (w === 'с' && i + 1 < words.length && words[i + 1].toLowerCase().replace(/[.,]/g, '') === 'половиной') {
      usedIndices.add(i);
      usedIndices.add(i + 1);
      if (currentChunk > 0) {
        currentChunk += 0.5;
      }
      i += 2;
      continue;
    }

    const numValue = wordToNumberMap[w];
    if (numValue !== undefined) {
      usedIndices.add(i);
      currentChunk += numValue;
      i++;
      continue;
    }

    const scaleValue = wordToScaleMap[w];
    if (scaleValue !== undefined) {
      usedIndices.add(i);
      if (currentChunk === 0) currentChunk = 1;
      totalAmount += currentChunk * scaleValue;
      currentChunk = 0;
      i++;
      continue;
    }

    if (w === 'полтора' || w === 'полторы') {
      usedIndices.add(i);
      currentChunk += 1.5;
      i++;
      continue;
    }

    i++;
  }

  totalAmount += currentChunk;
  return { amount: totalAmount, usedIndices };
}

function extractAmountAndRemainder(text: string): { amount: number; remainder: string } {
  // 1. Digit extraction
  const digitMatch = text.match(/(\d+[\d\s.,]*\d|\d+)/);
  if (digitMatch) {
    const rawNumStr = digitMatch[0].replace(/\s+/g, '').replace(',', '.');
    const parsed = parseFloat(rawNumStr);
    if (!isNaN(parsed) && parsed > 0) {
      const remainder = text.replace(digitMatch[0], '').trim();
      return { amount: parsed, remainder };
    }
  }

  // 2. Verbal extraction
  const words = text.split(/\s+/);
  const numberResult = parseRussianVerbalNumberInWords(words);
  if (numberResult.amount > 0) {
    const remainderWords = words.filter((_, idx) => !numberResult.usedIndices.has(idx));
    return { amount: numberResult.amount, remainder: remainderWords.join(' ') };
  }

  return { amount: 0, remainder: text };
}

export function parseVoiceCommand(rawText: string): VoiceCommand {
  const text = rawText.toLowerCase().trim();
  if (!text) return { kind: 'unknown', rawText };

  // Navigation & Control
  if (text.includes('отчёт') || text.includes('отчет')) {
    return { kind: 'navigate_report' };
  }
  if (text.includes('главная') || text.includes('домой') || text.includes('на главную')) {
    return { kind: 'navigate_main' };
  }
  if (text === 'назад' || text.includes('вернись') || text.includes('страница назад')) {
    return { kind: 'navigate_back' };
  }
  if (text.includes('удали последнее') || text.includes('удалить последнее') || text.includes('стереть последнее')) {
    return { kind: 'delete_last' };
  }
  if (text.includes('обнови') || text.includes('проверь обновления') || text.includes('проверить обновления') || text.includes('обновление')) {
    return { kind: 'check_update' };
  }

  // Transaction keywords
  const isProfit = text.includes('прибыль') || text.includes('доход') || text.includes('оплата') || text.includes('заработок');
  const isExpense = text.includes('трата') || text.includes('траты') || text.includes('расход') || text.includes('расходы') || text.includes('покупка');
  const isDebtor = text.includes('должник') || text.includes('долг') || text.includes('должники') || text.includes('в долг');

  if (isProfit || isExpense || isDebtor) {
    const type: TransactionType = isDebtor ? 'DEBTOR' : isExpense ? 'EXPENSE' : 'PROFIT';

    const { amount, remainder: rawRemainder } = extractAmountAndRemainder(text);
    let remainder = rawRemainder
      .replace(/прибыль|доход|трата|траты|расход|расходы|должник|должники|долг/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (amount > 0) {
      let clientInfo = '';
      let note = remainder;

      if (type === 'DEBTOR') {
        const parts = remainder.split(' ');
        if (parts.length >= 2) {
          clientInfo = `${parts[0]} ${parts[1]}`.trim();
          note = parts.length > 2 ? parts.slice(2).join(' ') : remainder;
        } else {
          clientInfo = remainder;
        }
      } else {
        const words = remainder.split(' ');
        if (words.length > 1 && words[words.length - 1].length > 2 && words[words.length - 1][0] === words[words.length - 1][0].toUpperCase()) {
          clientInfo = words[words.length - 1];
          note = words.slice(0, -1).join(' ');
        }
      }

      return {
        kind: 'add_transaction',
        type,
        amount,
        note: note || 'Голосовая запись',
        clientInfo
      };
    }
  }

  return { kind: 'unknown', rawText };
}
