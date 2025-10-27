import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

interface Payment {
  payment_id: string;
  amount: number;
  plan_name: string;
  plan_days: number;
  status: string;
  created_at: string;
}

interface PaymentHistoryProps {
  payments: Payment[];
  showHistory: boolean;
  onToggleHistory: () => void;
}

export const PaymentHistory = ({ payments, showHistory, onToggleHistory }: PaymentHistoryProps) => {
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'canceled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'succeeded': return 'Оплачен';
      case 'pending': return 'В ожидании';
      case 'canceled': return 'Отменен';
      default: return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>История платежей</CardTitle>
            <CardDescription>Все ваши транзакции</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleHistory}
          >
            <Icon 
              name={showHistory ? "ChevronUp" : "ChevronDown"} 
              className="w-4 h-4 mr-2" 
            />
            {showHistory ? 'Скрыть' : 'Показать'}
          </Button>
        </div>
      </CardHeader>
      
      {showHistory && (
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="Receipt" className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>История платежей пуста</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.payment_id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{payment.plan_name}</h4>
                      <Badge className={getPaymentStatusColor(payment.status)}>
                        {getPaymentStatusText(payment.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payment.created_at).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{payment.amount} ₽</p>
                    <p className="text-sm text-muted-foreground">{payment.plan_days} дней</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
