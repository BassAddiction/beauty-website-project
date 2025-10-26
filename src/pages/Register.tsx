import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { useNavigate } from 'react-router-dom';

interface Plan {
  plan_id: number;
  name: string;
  price: number;
  days: number;
  traffic_gb: number;
  is_active: boolean;
}

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/c56efe3d-0219-4eab-a894-5d98f0549ef0?action=get_plans');
        const data = await response.json();
        
        if (data.plans) {
          const activePlans = data.plans.filter((p: Plan) => p.is_active);
          setPlans(activePlans);
        }
      } catch (err) {
        console.error('Ошибка загрузки тарифов:', err);
        setError('Не удалось загрузить тарифы');
      } finally {
        setLoadingPlans(false);
      }
    };

    loadPlans();
  }, []);

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
            email: email,
            proxies: {
              'vless-reality': {}
            },
            data_limit: selectedPlan.traffic_gb * 1073741824,
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

      // Ждём 1 секунду перед добавлением в squad (API нужно время для индексации)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Добавляем пользователя в squad используя UUID из ответа
      try {
        const userUuid = responseData.uuid;
        
        const squadResponse = await fetch(
          'https://functions.poehali.dev/d8d680b3-23f3-481e-b8cf-ccb969e2f158',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'update_user',
              uuid: userUuid,
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
            {loadingPlans ? (
              <div className="text-center py-12">
                <Icon name="Loader2" className="w-12 h-12 animate-spin mx-auto text-primary" />
                <p className="mt-4 text-muted-foreground">Загрузка тарифов...</p>
              </div>
            ) : plans.length === 0 ? (
              <Card className="p-8 text-center">
                <Icon name="AlertCircle" className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
                <p className="text-lg">Нет доступных тарифов</p>
                <p className="text-sm text-muted-foreground mt-2">Попробуйте позже</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <Card 
                    key={plan.plan_id} 
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
                          <span>{plan.traffic_gb} ГБ/сутки</span>
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
                        {plan.features && plan.features.length > 0 && plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Icon name="Check" className="w-4 h-4 text-green-500" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                      <Button className="w-full button-glow">
                        Выбрать тариф
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground mb-3">
                Уже есть аккаунт?
              </p>
              <Button variant="outline" onClick={() => navigate('/login')}>
                <Icon name="LogIn" className="w-4 h-4 mr-2" />
                Войти
              </Button>
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