import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

interface Plan {
  id?: number;
  name: string;
  price: string;
  period: string;
  days?: number;
  popular?: boolean;
  custom?: boolean;
  features: string[];
}

interface PricingCardProps {
  plan: Plan;
  index: number;
  showAllPlans: boolean;
  onSelectPlan: (plan: Plan) => void;
  onTestWebhook: () => void;
  testing: boolean;
  paying: boolean;
}

export const PricingCard = ({ 
  plan, 
  index, 
  showAllPlans, 
  onSelectPlan, 
  onTestWebhook, 
  testing, 
  paying 
}: PricingCardProps) => {
  return (
    <Card 
      key={index} 
      className={`relative border-2 transition-all duration-300 hover:scale-105 ${
        plan.popular 
          ? 'border-primary shadow-xl' 
          : plan.custom 
          ? 'border-purple-500 shadow-lg' 
          : 'hover:border-primary'
      } ${!showAllPlans && index >= 3 ? 'hidden md:block' : ''}`}
    >
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
        <CardTitle className="text-2xl break-words">{plan.name}</CardTitle>
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
              <span className="text-sm break-words">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        {plan.price === "Free" ? (
          <Button 
            className="w-full rounded-full button-glow" 
            onClick={onTestWebhook}
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
            className="w-full rounded-full button-glow" 
            onClick={() => onSelectPlan(plan)}
            disabled={paying}
          >
            <Icon name="Zap" className="w-5 h-5 mr-2" />
            {paying ? "Обработка..." : "Подключить"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
