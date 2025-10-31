import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface PaymentMethodDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectMethod: (method: 'sbp' | 'sberpay' | 'tpay') => void;
}

const PaymentMethodDialog = ({ open, onClose, onSelectMethod }: PaymentMethodDialogProps) => {
  const paymentMethods = [
    {
      id: 'sbp' as const,
      name: 'СБП',
      description: 'Система быстрых платежей',
      icon: 'Zap'
    },
    {
      id: 'sberpay' as const,
      name: 'SberPay',
      description: 'Оплата через Сбербанк',
      icon: 'CreditCard'
    },
    {
      id: 'tpay' as const,
      name: 'T-Pay',
      description: 'Оплата через Т-Банк',
      icon: 'Smartphone'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Выберите способ оплаты</DialogTitle>
          <DialogDescription>
            Выберите удобный способ для совершения платежа
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 pt-4">
          {paymentMethods.map((method) => (
            <Button
              key={method.id}
              variant="outline"
              className="w-full h-auto py-4 px-4 flex items-center justify-start gap-4 hover:border-primary hover:bg-primary/5 transition-all"
              onClick={() => onSelectMethod(method.id)}
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name={method.icon} className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold text-lg">{method.name}</div>
                <div className="text-sm text-muted-foreground">{method.description}</div>
              </div>
              <Icon name="ChevronRight" className="w-5 h-5 text-muted-foreground" />
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentMethodDialog;
