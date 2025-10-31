import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Icon from "@/components/ui/icon";
import { useNavigate } from 'react-router-dom';
import PaymentMethodDialog from '@/components/PaymentMethodDialog';
import YooKassaWidget from '@/components/YooKassaWidget';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Plan {
  id: number;
  name: string;
  price: number;
  days: number;
  traffic: number;
  features: string[];
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
  const [showBuilderButton, setShowBuilderButton] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPaymentMethodDialog, setShowPaymentMethodDialog] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'sbp' | 'sberpay' | 'tpay' | null>(null);
  const [confirmationToken, setConfirmationToken] = useState<string>('');
  const [showPaymentWidget, setShowPaymentWidget] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansResponse, settingsResponse] = await Promise.all([
          fetch('https://functions.poehali.dev/fbbbfbaf-a8c7-4eec-8f61-5976ed535592'),
          fetch('https://functions.poehali.dev/c56efe3d-0219-4eab-a894-5d98f0549ef0?action=get_builder_settings')
        ]);
        
        const plansData = await plansResponse.json();
        setPlans(plansData.plans || []);
        
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          const showButton = settingsData.settings?.show_on_register;
          setShowBuilderButton(showButton !== undefined ? showButton : true);
        } else {
          setShowBuilderButton(true);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Не удалось загрузить тарифы');
      } finally {
        setLoadingPlans(false);
      }
    };
    
    fetchData();
  }, []);

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setEmail('');
    setAgreedToTerms(false);
    setStep(2);
  };

  const handleProceedToPaymentMethod = () => {
    if (!email.trim()) {
      setError('Введите Email');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Введите корректный email');
      return;
    }

    if (!agreedToTerms) {
      setError('Необходимо принять условия оферты');
      return;
    }

    setError('');
    setShowPaymentMethodDialog(true);
  };

  const handleSelectPaymentMethod = async (method: 'sbp' | 'sberpay' | 'tpay') => {
    setSelectedPaymentMethod(method);
    setShowPaymentMethodDialog(false);
    setLoading(true);

    try {
      const emailPrefix = email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '');
      const username = emailPrefix + '_' + Date.now();
      
      const paymentResponse = await fetch(
        'https://functions.poehali.dev/1cd4e8c8-3e41-470f-a824-9c8dd42b6c9c',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create_payment',
            username: username,
            email: email,
            amount: selectedPlan!.price,
            plan_name: selectedPlan!.name,
            plan_days: selectedPlan!.days,
            plan_id: selectedPlan!.id,
            payment_method: method,
            domain: window.location.hostname
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
      
      if (paymentData.confirmation_token) {
        setConfirmationToken(paymentData.confirmation_token);
        setShowPaymentWidget(true);
        setLoading(false);
      } else {
        throw new Error('Не получен токен оплаты');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterAndPay = (e: React.FormEvent) => {
    e.preventDefault();
    handleProceedToPaymentMethod();
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <a href="/" className="inline-block transition-transform hover:scale-105 mb-4">
            <img 
              src="https://cdn.poehali.dev/files/299c507f-f10f-4048-a927-9fa71def332e.jpg" 
              alt="Speed VPN" 
              className="w-20 h-20 rounded-full object-cover border-2 border-primary mx-auto"
            />
          </a>
          <h1 className="text-3xl font-bold mb-2">Регистрация в Speed VPN</h1>
          <p className="text-muted-foreground">Выберите тариф и создайте аккаунт</p>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            {loadingPlans ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-muted-foreground">Загрузка тарифов...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <Card 
                    key={plan.id} 
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
                        {plan.features.map((feature, idx) => (
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

            {showBuilderButton && (
              <div className="flex justify-center mb-6">
                <Card className="max-w-md w-full border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5 hover:border-purple-500/50 transition-all">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <div className="flex justify-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                          <Icon name="Sparkles" className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">Создайте свою подписку</h3>
                        <p className="text-sm text-muted-foreground">
                          Выберите нужные страны и настройте тариф под себя
                        </p>
                      </div>
                      <Button 
                        size="lg" 
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:opacity-90"
                        onClick={() => navigate('/builder')}
                      >
                        <Icon name="Wrench" className="w-5 h-5 mr-2" />
                        Собрать свою подписку
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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

                <div className="flex items-start space-x-3 p-4 bg-muted rounded-lg">
                  <Checkbox 
                    id="terms" 
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Я согласен с условиями оферты
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Нажимая кнопку оплаты, вы принимаете{' '}
                      <a 
                        href="/terms" 
                        target="_blank" 
                        className="text-primary hover:underline"
                      >
                        публичную оферту
                      </a>
                      {' '}и{' '}
                      <a 
                        href="/terms" 
                        target="_blank" 
                        className="text-primary hover:underline"
                      >
                        политику конфиденциальности
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Назад
                  </Button>
                  <Button type="submit" disabled={!agreedToTerms} className="flex-1 button-glow">
                    <Icon name="CreditCard" className="w-4 h-4 mr-2" />
                    Перейти к оплате
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

        <PaymentMethodDialog 
          open={showPaymentMethodDialog}
          onClose={() => setShowPaymentMethodDialog(false)}
          onSelectMethod={handleSelectPaymentMethod}
          loading={loading}
        />

        <Dialog open={showPaymentWidget} onOpenChange={setShowPaymentWidget}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Оплата подписки</DialogTitle>
            </DialogHeader>
            {confirmationToken && (
              <YooKassaWidget 
                confirmationToken={confirmationToken}
                onSuccess={() => {
                  window.location.href = '/payment-success';
                }}
                onError={(error) => {
                  console.error('Payment widget error:', error);
                  setShowPaymentWidget(false);
                  setError(error);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Register;