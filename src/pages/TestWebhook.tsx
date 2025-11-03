import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import API_ENDPOINTS from '@/config/api';

const TestWebhook = () => {
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  const handleTestWebhook = async () => {
    setTesting(true);
    setLogs([]);
    
    try {
      const username = `test_${Date.now()}`;
      addLog(`Создаю webhook для ${username}`);
      
      const webhook = {
        type: 'notification',
        event: 'payment.succeeded',
        object: {
          id: `test_${Date.now()}`,
          status: 'succeeded',
          amount: { value: '1.00', currency: 'RUB' },
          metadata: {
            username,
            plan_days: '1',
            plan_name: 'Test'
          },
          receipt: { customer: { email: 'test@test.com' } }
        }
      };
      
      addLog('Отправляю webhook...');
      
      const res = await fetch(API_ENDPOINTS.PAYMENT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhook)
      });
      
      addLog(`Ответ: ${res.status} ${res.statusText}`);
      
      const data = await res.json();
      addLog(`Данные: ${JSON.stringify(data, null, 2)}`);
      
      toast({
        title: res.ok ? '✅ Webhook отправлен' : '❌ Ошибка',
        description: `Username: ${username}. Проверь логи backend/payment`
      });
    } catch (e) {
      addLog(`ОШИБКА: ${e}`);
      toast({ title: '❌ Ошибка', description: String(e), variant: 'destructive' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Тест Webhook ЮKassa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Эта страница симулирует платёж от ЮKassa и проверяет создание пользователя в Remnawave
            </p>
            
            <Button 
              onClick={handleTestWebhook} 
              disabled={testing}
              size="lg"
              className="w-full"
            >
              {testing ? "Отправка..." : "🚀 Отправить тестовый webhook"}
            </Button>
            
            {logs.length > 0 && (
              <div className="bg-black/50 p-4 rounded-lg font-mono text-sm space-y-1">
                {logs.map((log, i) => (
                  <div key={i} className="text-green-400">{log}</div>
                ))}
              </div>
            )}
            
            <div className="pt-4 border-t">
              <h3 className="font-bold mb-2">Что проверять:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>1. Логи backend/payment - должны быть print логи</li>
                <li>2. Remnawave - должен создаться пользователь</li>
                <li>3. Лимит трафика - должно быть 30 GB</li>
                <li>4. Дата expire - должна быть завтра</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestWebhook;