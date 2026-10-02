import { TransactionEntity } from './types';

export function exportAndShareCsv(transactions: TransactionEntity[], filterName: string) {
  const BOM = '\uFEFF';
  const header = 'ID;Дата;Тип;Сумма;Описание/Заметка;Клиент/Авто\n';

  const rows = transactions.map(item => {
    const dateStr = new Date(item.date).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const typeStr = item.type === 'PROFIT' ? 'Прибыль' : item.type === 'EXPENSE' ? 'Трата' : 'Должник';
    const noteEscaped = item.note.replace(/;/g, ',').replace(/\n/g, ' ');
    const clientEscaped = item.clientInfo.replace(/;/g, ',').replace(/\n/g, ' ');

    return `${item.id};${dateStr};${typeStr};${item.amount};${noteEscaped};${clientEscaped}`;
  });

  const csvContent = BOM + header + rows.join('\n');
  const fileName = `finance_report_${new Date().toISOString().slice(0, 10)}.csv`;

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
