import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "@/components/ui/icon";

interface Receipt {
  id: number;
  payment_id: string;
  yookassa_receipt_id: string | null;
  tax_system_code: number;
  tax_system_name: string;
  vat_code: number;
  vat_name: string;
  amount: number;
  email: string;
  items: Array<{
    description: string;
    quantity: string;
    amount: { value: string; currency: string };
    vat_code: number;
  }>;
  status: string;
  receipt_url: string | null;
  created_at: string;
  username: string;
  plan_name: string;
  payment_status: string;
}

interface ReceiptsTabProps {
  password: string;
}

const RECEIPTS_API = 'https://functions.poehali.dev/2eb021b7-8d70-47e2-b4ca-6e113a73d436';

export const ReceiptsTab = ({ password }: ReceiptsTabProps) => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [searchEmail, setSearchEmail] = useState<string>('');

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${RECEIPTS_API}?limit=100&offset=0`, {
        headers: {
          'X-Admin-Token': password
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReceipts(data.receipts || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Ошибка загрузки чеков:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      succeeded: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredReceipts = receipts.filter(receipt => {
    if (filterStatus !== 'all' && receipt.payment_status !== filterStatus) return false;
    if (searchEmail && !receipt.email.toLowerCase().includes(searchEmail.toLowerCase())) return false;
    
    if (filterDateFrom || filterDateTo) {
      const receiptDate = new Date(receipt.created_at);
      if (filterDateFrom && receiptDate < new Date(filterDateFrom)) return false;
      if (filterDateTo && receiptDate > new Date(filterDateTo + 'T23:59:59')) return false;
    }
    
    return true;
  });

  const exportToCSV = () => {
    const headers = [
      'ID',
      'Дата',
      'Email',
      'Пользователь',
      'План',
      'Сумма (₽)',
      'Система налогообложения',
      'НДС',
      'Статус платежа',
      'Статус чека',
      'ID платежа'
    ];

    const rows = filteredReceipts.map(receipt => [
      receipt.id,
      new Date(receipt.created_at).toLocaleString('ru-RU'),
      receipt.email,
      receipt.username,
      receipt.plan_name,
      receipt.amount,
      receipt.tax_system_name,
      receipt.vat_name,
      receipt.payment_status,
      receipt.status,
      receipt.payment_id
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `receipts_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader2" className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Чеки</h2>
          <p className="text-gray-600">Всего: {total} | Показано: {filteredReceipts.length}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="default" disabled={filteredReceipts.length === 0}>
            <Icon name="Download" className="w-4 h-4 mr-2" />
            Экспорт CSV
          </Button>
          <Button onClick={loadReceipts} variant="outline">
            <Icon name="RefreshCw" className="w-4 h-4 mr-2" />
            Обновить
          </Button>
        </div>
      </div>

      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Статус платежа</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Все статусы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="pending">В ожидании</SelectItem>
                <SelectItem value="succeeded">Успешно</SelectItem>
                <SelectItem value="failed">Ошибка</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Email</label>
            <Input
              type="text"
              placeholder="Поиск по email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Дата от</label>
            <Input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Дата до</label>
            <Input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
            />
          </div>
        </div>
        
        {(filterStatus !== 'all' || searchEmail || filterDateFrom || filterDateTo) && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-4"
            onClick={() => {
              setFilterStatus('all');
              setSearchEmail('');
              setFilterDateFrom('');
              setFilterDateTo('');
            }}
          >
            <Icon name="X" className="w-4 h-4 mr-1" />
            Сбросить фильтры
          </Button>
        )}
      </Card>

      <div className="space-y-4">
        {filteredReceipts.map((receipt) => (
          <Card key={receipt.id} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="mb-2">
                  <span className="font-semibold">Платёж ID:</span>{' '}
                  <span className="text-sm text-gray-600">{receipt.payment_id}</span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Пользователь:</span> {receipt.username}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Email:</span> {receipt.email}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">План:</span> {receipt.plan_name}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Сумма:</span> {receipt.amount} ₽
                </div>
              </div>

              <div>
                <div className="mb-2">
                  <span className="font-semibold">Система налогообложения:</span>{' '}
                  <span className="text-blue-600">{receipt.tax_system_name}</span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold">НДС:</span>{' '}
                  <span className="text-blue-600">{receipt.vat_name}</span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Статус чека:</span>{' '}
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(receipt.status)}`}>
                    {receipt.status}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Статус платежа:</span>{' '}
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(receipt.payment_status)}`}>
                    {receipt.payment_status}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Дата создания:</span>{' '}
                  {new Date(receipt.created_at).toLocaleString('ru-RU')}
                </div>
                {receipt.receipt_url && (
                  <div>
                    <a
                      href={receipt.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      <Icon name="ExternalLink" className="w-4 h-4 mr-1" />
                      Открыть чек в ЮKassa
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <details>
                <summary className="cursor-pointer font-semibold text-sm hover:text-blue-600">
                  Позиции в чеке
                </summary>
                <div className="mt-2 space-y-2">
                  {receipt.items.map((item, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded text-sm">
                      <div>{item.description}</div>
                      <div className="text-gray-600">
                        Количество: {item.quantity} × {item.amount.value} {item.amount.currency}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </Card>
        ))}

        {filteredReceipts.length === 0 && receipts.length > 0 && (
          <div className="text-center py-12 text-gray-500">
            Нет чеков по заданным фильтрам
          </div>
        )}
        
        {receipts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Чеков пока нет
          </div>
        )}
      </div>
    </div>
  );
};