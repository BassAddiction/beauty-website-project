import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface PricingCardProps {
  paymentLoading: boolean;
  onPayment: (plan: { name: string; price: number; days: number }) => void;
}

const plans = [
  { name: '1 месяц', price: 300, days: 30 },
  { name: '3 месяца', price: 800, days: 90 },
  { name: '6 месяцев', price: 1500, days: 180 },
  { name: '1 год', price: 2500, days: 365 }
];

export const PricingCard = ({ paymentLoading, onPayment }: PricingCardProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Тарифы</CardTitle>
        <CardDescription>Выберите подходящий план подписки</CardDescription>
      </CardHeader>
      <CardContent>
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
                  'Оплатить'
                )}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
