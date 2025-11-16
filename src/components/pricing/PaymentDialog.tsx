import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

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
          <DialogTitle>Оформление подписки: {selectedPlan?.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email для доступа</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              required
              autoFocus
            />
            <p className="text-sm text-muted-foreground">
              На этот email придет доступ к VPN
            </p>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => onAgreedToTermsChange(checked as boolean)}
            />
            <label
              htmlFor="terms"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Я принимаю{' '}
              <a
                href="https://docs.google.com/document/d/1w2OmfQAW_Jx0LW4OHPEFRWOt0mSGSDsJMbRO-oAjhYU/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                условия оферты
              </a>
            </label>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Button type="submit" className="w-full" disabled={paying}>
              {paying ? 'Обработка...' : `Оплатить ${selectedPlan?.price}₽`}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full"
              disabled={paying}
            >
              Отмена
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
