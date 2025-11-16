import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

export const CustomPlanCard = () => {
  return (
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
  );
};
