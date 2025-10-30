import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useState, useEffect } from 'react';

interface PricingCardProps {
  paymentLoading: boolean;
  onPayment: (plan: { name: string; price: number; days: number }) => void;
}

interface Plan {
  name: string;
  price: number;
  days: number;
  features?: string[];
}

export const PricingCard = ({ paymentLoading, onPayment }: PricingCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/c56efe3d-0219-4eab-a894-5d98f0549ef0?action=get_plans');
        const data = await response.json();
        
        console.log('Dashboard plans API response:', data);
        
        let formattedPlans = data.plans
          .filter((plan: any) => plan.show_on && plan.show_on.includes('dashboard'))
          .map((plan: any) => ({
            name: plan.name,
            price: plan.price,
            days: plan.days,
            features: plan.features || []
          }));
        
        // Если нет тарифов с dashboard, показываем все тарифы кроме custom
        if (formattedPlans.length === 0) {
          console.log('No dashboard plans found, showing all non-custom plans');
          formattedPlans = data.plans
            .filter((plan: any) => !plan.custom)
            .map((plan: any) => ({
              name: plan.name,
              price: plan.price,
              days: plan.days,
              features: plan.features || []
            }));
        }
        
        console.log('Formatted plans for dashboard:', formattedPlans);
        setPlans(formattedPlans);
      } catch (error) {
        console.error('Failed to load plans:', error);
        setPlans([
          { name: '1 месяц', price: 200, days: 30, features: [] },
          { name: '3 месяца', price: 500, days: 90, features: [] },
          { name: '6 месяцев', price: 900, days: 180, features: [] },
          { name: '1 год', price: 1200, days: 365, features: [] }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    loadPlans();
  }, []);

  return (
    <Card className="mb-6">
      <CardHeader 
        className="cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Продление подписки</CardTitle>
            <CardDescription>Выберите подходящий план</CardDescription>
          </div>
          <Icon 
            name={isOpen ? "ChevronUp" : "ChevronDown"} 
            className="w-5 h-5 text-muted-foreground"
          />
        </div>
      </CardHeader>
      {isOpen && (
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <Icon name="Loader2" className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-muted-foreground">Загрузка тарифов...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Тарифы не найдены</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="p-6 rounded-lg border hover:border-primary transition-colors"
            >
              <div className="mb-4">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">₽</span>
                </div>
              </div>
              
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <Icon name="Check" className="w-4 h-4 text-green-500" />
                  <span>Безлимитный трафик</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Icon name="Check" className="w-4 h-4 text-green-500" />
                  <span>Высокая скорость</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Icon name="Check" className="w-4 h-4 text-green-500" />
                  <span>Все серверы</span>
                </li>
              </ul>

              <Button
                onClick={() => onPayment(plan)}
                disabled={paymentLoading}
                className="w-full"
              >
                {paymentLoading ? (
                  <>
                    <Icon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                    Обработка...
                  </>
                ) : (
                  'Продлить'
                )}
              </Button>
            </div>
          ))}
        </div>
        )}
      </CardContent>
      )}
    </Card>
  );
};