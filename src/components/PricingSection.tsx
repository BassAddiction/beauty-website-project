import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Plan {
  plan_id?: number;
  name: string;
  price: string;
  period: string;
  popular?: boolean;
  custom?: boolean;
  features: string[];
}

const PricingSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilderButton, setShowBuilderButton] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [plansResponse, settingsResponse] = await Promise.all([
          fetch('https://functions.poehali.dev/c56efe3d-0219-4eab-a894-5d98f0549ef0?action=get_plans'),
          fetch('https://functions.poehali.dev/c56efe3d-0219-4eab-a894-5d98f0549ef0?action=get_builder_settings')
        ]);
        
        const plansData = await plansResponse.json();
        
        const formattedPlans = plansData.plans
          .filter((plan: any) => plan.show_on && plan.show_on.includes('pricing'))
          .map((plan: any, index: number) => ({
            name: plan.name,
            price: plan.price.toString(),
            period: '₽',
            popular: index === 0,
            custom: plan.custom,
            features: plan.features || []
          }));
        
        setPlans(formattedPlans);
        
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          console.log('Pricing settings data:', settingsData);
          const showButton = settingsData.settings?.show_on_pricing;
          console.log('Show button on pricing:', showButton);
          setShowBuilderButton(showButton !== undefined ? showButton : true);
        } else {
          setShowBuilderButton(true);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        setPlans(getDefaultPlans());
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const getDefaultPlans = () => [
    {
      name: "1 Месяц",
      price: "200",
      period: "₽",
      popular: true,
      features: [
        "30 ГБ трафика в сутки",
        "Без ограничений устройств",
        "Любые локации",
        "Базовая поддержка"
      ]
    }
  ];

  const handleTestWebhook = async () => {
    setTesting(true);
    try {
      const testUsername = `test_${Date.now()}`;
      const webhook = {
        type: 'notification',
        event: 'payment.succeeded',
        object: {
          id: `test_${Date.now()}`,
          status: 'succeeded',
          amount: { value: '1.00', currency: 'RUB' },
          metadata: {
            username: testUsername,
            plan_days: '1',
            plan_name: 'Test'
          },
          receipt: { customer: { email: 'test@test.com' } }
        }
      };
      
      const res = await fetch('https://functions.poehali.dev/1cd4e8c8-3e41-470f-a824-9c8dd42b6c9c', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhook)
      });
      
      toast({
        title: res.ok ? '✅ Webhook отправлен' : '❌ Ошибка',
        description: `Username: ${testUsername}. Проверь логи backend/payment`
      });
    } catch (e) {
      toast({ title: '❌ Ошибка', description: String(e), variant: 'destructive' });
    } finally {
      setTesting(false);
    }
  };

  const handlePayment = async (plan: Plan) => {
    if (!username.trim() || !email.trim()) {
      toast({
        title: '❌ Заполните данные',
        description: 'Введите Username и Email перед оплатой',
        variant: 'destructive'
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: '❌ Некорректный email',
        description: 'Введите правильный адрес электронной почты',
        variant: 'destructive'
      });
      return;
    }

    setPaying(true);
    try {
      const price = parseInt(plan.price);
      const days = plan.name === '1 Месяц' ? 30 : 
                   plan.name === '3 Месяца' ? 90 :
                   plan.name === '6 Месяцев' ? 180 :
                   plan.name === '12 Месяцев' ? 365 : 30;

      localStorage.setItem('vpn_username', username.trim());
      localStorage.setItem('vpn_email', email.trim());

      const params = new URLSearchParams({
        amount: price.toString(),
        plan_name: plan.name,
        plan_days: days.toString(),
        username: username.trim(),
        email: email.trim()
      });

      const url = `https://functions.poehali.dev/1cd4e8c8-3e41-470f-a824-9c8dd42b6c9c?${params}`;
      console.log('Payment request:', { url, plan, username: username.trim(), email: email.trim() });

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Payment response status:', res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Payment error response:', errorText);
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      console.log('Payment data:', data);

      if (data.confirmation_url) {
        window.location.href = data.confirmation_url;
      } else {
        toast({
          title: '❌ Ошибка создания платежа',
          description: data.error || 'Не получена ссылка на оплату',
          variant: 'destructive'
        });
      }
    } catch (e) {
      console.error('Payment error:', e);
      toast({
        title: '❌ Ошибка подключения',
        description: e instanceof Error ? e.message : 'Проверьте интернет-соединение и попробуйте снова',
        variant: 'destructive'
      });
    } finally {
      setPaying(false);
    }
  };



  return (
    <section ref={ref} className="py-20 px-4 bg-black/30" id="pricing">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-black mb-4">Тарифы</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Выберите подходящий план и начните защищённый сёрфинг уже сегодня
          </p>
        </div>



        {loading ? (
          <div className="text-center py-12">
            <Icon name="Loader2" className="w-12 h-12 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Загрузка тарифов...</p>
          </div>
        ) : (
          <>
            {showBuilderButton && (
              <div className="flex justify-center mb-8">
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
                        onClick={() => window.location.href = '/builder'}
                    >
                      <Icon name="Wrench" className="w-5 h-5 mr-2" />
                      Собрать свою подписку
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            )}

            <div className={`grid md:grid-cols-2 lg:grid-cols-6 gap-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {plans.map((plan, index) => (
            <Card key={index} className={`relative border-2 transition-all duration-300 hover:scale-105 ${plan.popular ? 'border-primary shadow-xl' : plan.custom ? 'border-purple-500 shadow-lg' : 'hover:border-primary'}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold">
                  Популярный
                </div>
              )}
              {plan.custom && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                  Премиум
                </div>
              )}
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <img 
                    src="https://cdn.poehali.dev/files/299c507f-f10f-4048-a927-9fa71def332e.jpg" 
                    alt="Speed VPN" 
                    className="w-20 h-20 rounded-full object-cover border-2 border-primary logo-animated"
                  />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="text-5xl font-black">{plan.price}</span>
                  <span className="text-2xl text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <Icon name="Check" size={20} className="text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {plan.price === "Free" ? (
                  <Button 
                    className="w-full rounded-full button-glow" 
                    onClick={handleTestWebhook}
                    disabled={testing}
                  >
                    {testing ? "Отправка..." : "🧪 Тест"}
                  </Button>
                ) : plan.custom ? (
                  <Button className="w-full rounded-full button-glow" asChild>
                    <a href="https://t.me/gospeedvpn" target="_blank" rel="noopener noreferrer">
                      Связаться
                    </a>
                  </Button>
                ) : (
                  <Button 
                    className="w-full rounded-full button-glow relative overflow-hidden group"
                    disabled={paying}
                    onClick={() => handlePayment(plan)}
                  >
                    {paying ? (
                      <>
                        <Icon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                        Обработка...
                      </>
                    ) : (
                      <>
                        <Icon name="Zap" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        Подключить
                      </>
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
            ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default PricingSection;