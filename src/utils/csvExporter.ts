import { Transaction } from '../types/finance';

export function exportAndShareCsv(transactions: Transaction[], filterName: string): void {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = new Date().toTimeString().slice(0, 8).replace(/:/g, '');
  const fileName = `finance_report_${dateStr}_${timeStr}.csv`;

  const rows: string[] = [];

  // UTF-8 BOM (\uFEFF) for Excel compatibility in Russian locale
  rows.push('\uFEFFID;Дата;Тип;Сумма;Описание/Заметка;Клиент/Авто');

  for (const item of transactions) {
    const formattedDate = new Date(item.date).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const typeStr =
      item.type === 'PROFIT'
        ? 'Прибыль'
        : item.type === 'EXPENSE'
        ? 'Трата'
        : 'Должник';

    const noteEscaped = item.note.replace(/;/g, ',').replace(/\n/g, ' ');
    const clientEscaped = item.clientInfo.replace(/;/g, ',').replace(/\n/g, ' ');

    rows.push(`${item.id};${formattedDate};${typeStr};${item.amount};${noteEscaped};${clientEscaped}`);
  }

  const csvContent = rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
