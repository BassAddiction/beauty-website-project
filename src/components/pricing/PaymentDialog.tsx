import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
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

interface PaymentDialogProps {
  show: boolean;
  onClose: () => void;
  selectedPlan: Plan | null;
  email: string;
  onEmailChange: (email: string) => void;
  agreedToTerms: boolean;
  onAgreedToTermsChange: (agreed: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  paying: boolean;
}

export const PaymentDialog = ({
  show,
  onClose,
  selectedPlan,
  email,
  onEmailChange,
  agreedToTerms,
  onAgreedToTermsChange,
  onSubmit,
  paying
}: PaymentDialogProps) => {
  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Завершите регистрацию</DialogTitle>
          {selectedPlan && (
            <p className="text-muted-foreground">
              Вы выбрали тариф: <span className="font-bold">{selectedPlan.name}</span> за <span className="font-bold">{selectedPlan.price}₽</span>
            </p>
          )}
        </DialogHeader>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              На этот email будут отправлены данные для входа
            </p>
          </div>

          <div className="flex items-start space-x-2 p-4 rounded-lg bg-muted/50">
            <Checkbox 
              id="terms" 
              checked={agreedToTerms}
              onCheckedChange={(checked) => onAgreedToTermsChange(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Я согласен с условиями оферты
              </label>
              <p className="text-xs text-muted-foreground">
                Нажимая кнопку оплаты, вы принимаете{' '}
                <a href="/terms" target="_blank" className="text-primary hover:underline">
                  публичную оферту
                </a>{' '}
                и{' '}
                <a href="/terms" target="_blank" className="text-primary hover:underline">
                  политику конфиденциальности
                </a>
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={onClose}
            >
              Назад
            </Button>
            <Button 
              type="submit" 
              className="flex-1 button-glow"
              disabled={!agreedToTerms}
            >
              <Icon name="CreditCard" className="w-4 h-4 mr-2" />
              Перейти к оплате
            </Button>
          </div>

          <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex gap-2">
              <Icon name="Info" className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-medium text-blue-400">После оплаты вы получите доступ к личному кабинету с настройками подключения VPN</p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex gap-2">
              <Icon name="AlertCircle" className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-medium text-yellow-400">Не получили доступ после оплаты?</p>
                <p className="text-muted-foreground">
                  Если после оплаты страница не загрузилась - не переживайте! Перейдите на страницу{' '}
                  <a href="/restore" className="text-primary hover:underline font-medium">
                    Восстановить доступ
                  </a>{' '}
                  и введите ваш email. Вы сразу получите ссылку на VPN.
                </p>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};