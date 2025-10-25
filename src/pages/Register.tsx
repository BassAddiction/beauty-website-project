import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { useNavigate } from 'react-router-dom';

interface Plan {
  name: string;
  price: number;
  days: number;
  traffic: number;
}

const PLANS: Plan[] = [
  { name: '1 месяц', price: 10, days: 30, traffic: 30 },
  { name: '3 месяца', price: 500, days: 90, traffic: 30 },
  { name: '6 месяцев', price: 900, days: 180, traffic: 30 }
];

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [testMode, setTestMode] = useState(false); // Тестовый режим

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setStep(2);
  };

  const handleRegisterAndPay = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !selectedPlan) {
      setError('Заполните все поля');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Введите корректный email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Генерируем username только из букв, цифр, подчёркиваний и дефисов
      const emailPrefix = email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '');
      const username = emailPrefix + '_' + Date.now();
      
      const createUserResponse = await fetch(
        'https://functions.poehali.dev/d8d680b3-23f3-481e-b8cf-ccb969e2f158',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create_user',
            username: username,
            proxies: {
              'vless-reality': {}
            },
            data_limit: 32212254720,
            expire: Math.floor(Date.now() / 1000) + (selectedPlan.days * 86400),
            data_limit_reset_strategy: 'day'
          })
        }
      );

      if (!createUserResponse.ok) {
        const errorData = await createUserResponse.text();
        throw new Error(`Ошибка создания аккаунта: ${errorData}`);
      }

      // Получаем данные созданного пользователя
      const createUserData = await createUserResponse.json();
      const responseData = createUserData.response || createUserData;
      const subscriptionUrl = responseData.subscriptionUrl || responseData.subscription_url || '';
      
      // Сохраняем subscriptionUrl сразу после создания
      if (subscriptionUrl) {
        localStorage.setItem('vpn_subscription_url', subscriptionUrl);
      }

      // Добавляем пользователя в squad сразу после создания
      try {
        const squadResponse = await fetch(
          'https://functions.poehali.dev/d8d680b3-23f3-481e-b8cf-ccb969e2f158',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'update_user',
              username: username,
              inbounds: {
                'vless-reality': ['e742f30b-82fb-431a-918b-1b4d22d6ba4d']
              }
            })
          }
        );
        
        if (!squadResponse.ok) {
          console.error('Ошибка добавления в squad:', await squadResponse.text());
        } else {
          console.log('✅ Пользователь добавлен в squad');
        }
      } catch (squadError) {
        console.error('Не удалось добавить в squad:', squadError);
      }

      // ТЕСТОВЫЙ РЕЖИМ - пропускаем оплату
      if (testMode) {
        // Создаем фейковый платеж для тестового режима
        try {
          await fetch('https://functions.poehali.dev/d6f1cac6-9e90-4d35-8d25-7c2af6ea4d18', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              payment_id: 'test_' + Date.now(),
              username: username,
              email: email,
              amount: selectedPlan.price,
              plan_name: selectedPlan.name,
              plan_days: selectedPlan.days,
              status: 'succeeded'
            })
          });
        } catch (error) {
          console.error('Ошибка создания тестового платежа:', error);
        }
        
        localStorage.setItem('vpn_username', username);
        localStorage.setItem('vpn_email', email);
        alert(`✅ Тестовый пользователь создан!\nUsername: ${username}\n\nПроверь панель админки!`);
        navigate('/dashboard');
        return;
      }

      const paymentResponse = await fetch(
        'https://functions.poehali.dev/1cd4e8c8-3e41-470f-a824-9c8dd42b6c9c',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create_payment',
            username: username,
            email: email,
            amount: selectedPlan.price,
            plan_name: selectedPlan.name,
            plan_days: selectedPlan.days
          })
        }
      );

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.text();
        throw new Error(`Ошибка создания платежа: ${errorData}`);
      }

      const paymentData = await paymentResponse.json();
      
      localStorage.setItem('vpn_username', username);
      localStorage.setItem('vpn_email', email);
      localStorage.setItem('vpn_payment_id', paymentData.payment_id || '');
      
      if (paymentData.confirmation_url) {
        // Показываем пользователю что платёж создан
        alert(`Платёж создан! ID: ${paymentData.payment_id}\nСейчас откроется страница оплаты.`);
        window.location.href = paymentData.confirmation_url;
      } else {
        throw new Error('Не получена ссылка на оплату');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <img 
            src="https://cdn.poehali.dev/files/299c507f-f10f-4048-a927-9fa71def332e.jpg" 
            alt="Speed VPN" 
            className="w-20 h-20 rounded-full object-cover border-2 border-primary mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold mb-2">Регистрация в Speed VPN</h1>
          <p className="text-muted-foreground">Выберите тариф и создайте аккаунт</p>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLANS.map((plan) => (
                <Card 
                  key={plan.name} 
                  className="border-2 hover:border-primary transition-all cursor-pointer"
                  onClick={() => handleSelectPlan(plan)}
                >
                  <CardHeader>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>
                      <span className="text-4xl font-bold text-foreground">{plan.price}₽</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Icon name="Check" className="w-4 h-4 text-green-500" />
                        <span>{plan.traffic} ГБ/сутки</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="Check" className="w-4 h-4 text-green-500" />
                        <span>{plan.days} дней</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="Check" className="w-4 h-4 text-green-500" />
                        <span>Любые локации</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="Check" className="w-4 h-4 text-green-500" />
                        <span>Неограниченные устройства</span>
                      </div>
                    </div>
                    <Button className="w-full button-glow">
                      Выбрать тариф
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground mb-3">
                Уже есть аккаунт?
              </p>
              <Button variant="outline" onClick={() => navigate('/login')}>
                <Icon name="LogIn" className="w-4 h-4 mr-2" />
                Войти
              </Button>
              
              {/* Секретная кнопка для тестового режима */}
              <div className="mt-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setTestMode(!testMode)}
                  className="text-xs opacity-30 hover:opacity-100"
                >
                  {testMode ? '🧪 Тест ON' : '🔧 Режим разработки'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && selectedPlan && (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Завершите регистрацию</CardTitle>
              <CardDescription>
                Вы выбрали тариф: <strong>{selectedPlan.name}</strong> за <strong>{selectedPlan.price}₽</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegisterAndPay} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="text-base"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    На этот email будут отправлены данные для входа
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm">
                    <Icon name="AlertCircle" className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    disabled={loading}
                    className="flex-1"
                  >
                    Назад
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1 button-glow">
                    {loading ? (
                      <>
                        <Icon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                        Создание...
                      </>
                    ) : (
                      <>
                        <Icon name="ShoppingCart" className="w-4 h-4 mr-2" />
                        Купить
                      </>
                    )}
                  </Button>
                </div>
              </form>

              <div className="mt-6 pt-6 border-t space-y-4">
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Icon name="Info" className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>
                    После оплаты вы получите доступ к личному кабинету с настройками подключения VPN
                  </p>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start gap-2">
                    <Icon name="AlertCircle" className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-yellow-800 dark:text-yellow-200">
                        Не получили доступ после оплаты?
                      </p>
                      <p className="text-yellow-700 dark:text-yellow-300">
                        Если после оплаты страница не загрузилась - не переживайте! Перейдите на страницу{' '}
                        <a 
                          href="/get-access" 
                          className="font-semibold underline hover:no-underline"
                        >
                          Восстановить доступ
                        </a>
                        {' '}и введите ваш email. Вы сразу получите ссылку на VPN.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Register;