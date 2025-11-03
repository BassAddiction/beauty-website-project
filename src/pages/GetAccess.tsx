import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import API_ENDPOINTS, { CDN_ASSETS } from '@/config/api';

interface Payment {
  payment_id: string;
  amount: number;
  plan_name: string;
  plan_days: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Subscription {
  days_left: number | null;
  expire_timestamp: number | null;
  subscription_url: string;
  is_active: boolean;
}

const GetAccess = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [showPayments, setShowPayments] = useState(false);

  const handleGetAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowPayments(false);

    if (!username.trim()) {
      setError('Введите username');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_ENDPOINTS.GET_SUBSCRIPTION}?username=${encodeURIComponent(username)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (!response.ok) {
        throw new Error('Пользователь не найден или нет подписок');
      }

      const data = await response.json();
      
      if (data.payments && data.payments.length > 0) {
        setPayments(data.payments);
        setSubscription(data.subscription || null);
        setShowPayments(true);
      } else {
        setError('Подписки не найдены. Проверьте username или оформите новую подписку.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <a href="/" className="transition-transform hover:scale-105">
              <img 
                src={CDN_ASSETS.LOGO} 
                alt="Speed VPN" 
                className="w-16 h-16 rounded-full object-cover border-2 border-primary"
              />
            </a>
          </div>
          <CardTitle className="flex items-center gap-2 justify-center">
            <Icon name="Key" className="w-6 h-6" />
            Мои подписки
          </CardTitle>
          <CardDescription>
            Введите ваш username для просмотра истории подписок
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showPayments ? (
            <form onSubmit={handleGetAccess} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="pomytkinserdj_1761322601020"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Username указан в письме с подтверждением оплаты
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm">
                  <Icon name="AlertCircle" className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full button-glow">
                {loading ? (
                  <>
                    <Icon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Icon name="Search" className="w-4 h-4 mr-2" />
                    Показать подписки
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Мои подписки</h3>
                <Button 
                  onClick={() => {
                    setShowPayments(false);
                    setUsername('');
                    setPayments([]);
                    setSubscription(null);
                  }} 
                  variant="outline"
                  size="sm"
                >
                  <Icon name="ArrowLeft" className="w-4 h-4 mr-2" />
                  Назад
                </Button>
              </div>

              {subscription && (
                <Card className={subscription.is_active ? 'border-green-500' : 'border-red-500'}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Icon 
                            name={subscription.is_active ? 'Zap' : 'AlertCircle'} 
                            className={`w-5 h-5 ${
                              subscription.is_active
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          />
                          <h4 className="font-semibold text-lg">
                            {subscription.is_active ? 'Подписка активна' : 'Подписка истекла'}
                          </h4>
                        </div>
                        {subscription.is_active && subscription.days_left !== null && (
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {subscription.days_left} {subscription.days_left === 1 ? 'день' : subscription.days_left < 5 ? 'дня' : 'дней'}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {subscription.is_active ? 'до окончания подписки' : 'Продлите подписку для доступа'}
                        </p>
                      </div>
                      {subscription.is_active && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">До</p>
                          <p className="text-sm font-medium">
                            {subscription.expire_timestamp
                              ? new Date(subscription.expire_timestamp * 1000).toLocaleDateString('ru-RU', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })
                              : '—'}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <h4 className="font-medium text-sm text-muted-foreground">История платежей</h4>

              <div className="space-y-3">
                {payments.map((payment) => (
                  <Card key={payment.payment_id} className={
                    payment.status === 'succeeded' 
                      ? 'border-green-500 bg-green-50 dark:bg-green-950' 
                      : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
                  }>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Icon 
                              name={payment.status === 'succeeded' ? 'CheckCircle' : 'Clock'} 
                              className={`w-5 h-5 ${
                                payment.status === 'succeeded' 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : 'text-yellow-600 dark:text-yellow-400'
                              }`}
                            />
                            <h4 className="font-semibold">{payment.plan_name}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {payment.plan_days} дней • {payment.amount} ₽
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Дата: {new Date(payment.created_at).toLocaleDateString('ru-RU', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          payment.status === 'succeeded'
                            ? 'bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-yellow-200 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        }`}>
                          {payment.status === 'succeeded' ? 'Оплачено' : 'Ожидание'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Username:</strong> {username}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Используйте этот username для входа в личный кабинет
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GetAccess;