import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Plan {
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
  const [isCreatingDemo, setIsCreatingDemo] = useState(false);

  const handleDemoRegistration = async () => {
    setIsCreatingDemo(true);
    try {
      const username = `test_${Date.now()}`;
      
      const fakeWebhook = {
        type: 'notification',
        event: 'payment.succeeded',
        object: {
          id: `test_${Date.now()}`,
          status: 'succeeded',
          amount: { value: '1.00', currency: 'RUB' },
          metadata: {
            username: username,
            plan_days: '1',
            plan_name: 'Test 1d'
          },
          receipt: {
            customer: { email: 'test@demo.com' }
          }
        }
      };
      
      const response = await fetch('https://functions.poehali.dev/1cd4e8c8-3e41-470f-a824-9c8dd42b6c9c', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fakeWebhook)
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "🎉 Тестовый webhook отправлен!",
          description: `Username: ${username}\nПроверяй логи backend/payment`
        });
      } else {
        throw new Error(data.error || 'Ошибка webhook');
      }
    } catch (error) {
      toast({
        title: "❌ Ошибка",
        description: error instanceof Error ? error.message : 'Не удалось отправить webhook',
        variant: "destructive"
      });
    } finally {
      setIsCreatingDemo(false);
    }
  };

  const plans: Plan[] = [
    {
      name: "Тест 24ч",
      price: "Free",
      period: "",
      features: [
        "30 ГБ трафика в сутки",
        "Без ограничений устройств",
        "Любые локации",
        "Доступ на 24 часа"
      ]
    },
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
    },
    {
      name: "3 Месяца",
      price: "550",
      period: "₽",
      features: [
        "30 ГБ трафика в сутки",
        "Без ограничений устройств",
        "Любые локации",
        "Приоритетная поддержка 24/7"
      ]
    },
    {
      name: "6 Месяцев",
      price: "1000",
      period: "₽",
      features: [
        "30 ГБ трафика в сутки",
        "Без ограничений устройств",
        "Любые локации",
        "Приоритетная поддержка 24/7"
      ]
    },
    {
      name: "12 Месяцев",
      price: "1500",
      period: "₽",
      features: [
        "30 ГБ трафика в сутки",
        "Без ограничений устройств",
        "Любые локации",
        "VIP поддержка 24/7"
      ]
    },
    {
      name: "Persona",
      price: "От 2000",
      period: "₽",
      custom: true,
      features: [
        "Безлимитный трафик",
        "Выделенный сервер",
        "Персональные настройки",
        "Личный менеджер 24/7"
      ]
    }
  ];

  return (
    <section ref={ref} className="py-20 px-4 bg-black/30" id="pricing">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-black mb-4">Тарифы</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Выберите подходящий план и начните защищённый сёрфинг уже сегодня
          </p>
        </div>

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
                    onClick={handleDemoRegistration}
                    disabled={isCreatingDemo}
                  >
                    {isCreatingDemo ? "Отправка..." : "🧪 Тест Webhook"}
                  </Button>
                ) : (
                  <Button className="w-full rounded-full button-glow" asChild>
                    <a href={plan.custom ? "https://t.me/gospeedvpn" : "https://t.me/shopspeedvpn_bot"} target="_blank" rel="noopener noreferrer">
                      {plan.custom ? "Связаться" : "Выбрать план"}
                    </a>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;