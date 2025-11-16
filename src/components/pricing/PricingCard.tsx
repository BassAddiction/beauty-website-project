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
  onSelect: (plan: Plan) => void;
  paying: boolean;
}

export const PricingCard = ({ plan, onSelect, paying }: PricingCardProps) => {
  return (
    <Card
      className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
        plan.popular
          ? "border-primary shadow-lg shadow-primary/20"
          : "border-border"
      } ${!plan.custom ? "animate-slide-up" : ""}`}
      style={{ animationDelay: plan.popular ? "0.1s" : "0.2s" }}
    >
      {plan.popular && (
        <div className="absolute -right-12 top-8 rotate-45 bg-primary px-12 py-1 text-xs font-bold">
          Популярный
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-3xl">{plan.name}</CardTitle>
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-black">{plan.price}</span>
          <span className="text-2xl text-muted-foreground">{plan.period}</span>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              <Icon
                name="CheckCircle2"
                className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
              />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          variant={plan.popular ? "default" : "outline"}
          onClick={() => onSelect(plan)}
          disabled={paying}
        >
          {paying ? "Обработка..." : "Купить"}
        </Button>
      </CardFooter>
    </Card>
  );
};
