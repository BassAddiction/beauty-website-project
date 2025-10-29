import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";

interface CustomPlan {
  name: string;
  price: number;
  days: number;
  traffic: number;
  locations: any[];
}

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [paying, setPaying] = useState(false);

  const customPlan = location.state?.customPlan as CustomPlan | undefined;

  useEffect(() => {
    if (!customPlan) {
      navigate('/builder');
      return;
    }

    const savedUsername = localStorage.getItem('vpn_username');
    const savedEmail = localStorage.getItem('vpn_email');
    if (savedUsername) setUsername(savedUsername);
    if (savedEmail) setEmail(savedEmail);
  }, [customPlan, navigate]);

  const handlePayment = async () => {
    if (!customPlan) return;

    if (!username.trim() || !email.trim()) {
      toast({
        title: '❌ Заполните данные',
        description: 'Введите Username и Email перед оплатой',
        variant: 'destructive'
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: '❌ Некорректный email',
        description: 'Введите правильный адрес электронной почты',
        variant: 'destructive'
      });
      return;
    }

    setPaying(true);
    try {
      localStorage.setItem('vpn_username', username.trim());
      localStorage.setItem('vpn_email', email.trim());

      const params = new URLSearchParams({
        amount: Math.round(customPlan.price).toString(),
        plan_name: customPlan.name,
        plan_days: customPlan.days.toString(),
        username: username.trim(),
        email: email.trim(),
        custom_plan: JSON.stringify({
          locations: customPlan.locations.map(loc => ({
            location_id: loc.location_id,
            days: loc.days
          }))
        })
      });

      const url = `https://functions.poehali.dev/1cd4e8c8-3e41-470f-a824-9c8dd42b6c9c?${params}`;

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      const data = await res.json();

      if (data.confirmation_url) {
        window.location.href = data.confirmation_url;
      } else {
        toast({
          title: '❌ Ошибка создания платежа',
          description: data.error || 'Не получена ссылка на оплату',
          variant: 'destructive'
        });
      }
    } catch (e) {
      console.error('Payment error:', e);
      toast({
        title: '❌ Ошибка оплаты',
        description: String(e),
        variant: 'destructive'
      });
    } finally {
      setPaying(false);
    }
  };

  if (!customPlan) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Оформление подписки</CardTitle>
            <CardDescription>
              Заполните данные для создания аккаунта
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold">План:</span>
                <span>{customPlan.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Стоимость:</span>
                <Badge variant="default" className="text-lg px-3 py-1">
                  {Math.round(customPlan.price)} ₽
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Срок:</span>
                <span>{customPlan.days} дней</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Трафик:</span>
                <span>{customPlan.traffic} ГБ</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Локации:</span>
                <span>{customPlan.locations.length} шт</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username для VPN</Label>
              <Input
                id="username"
                type="text"
                placeholder="myusername"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Будет использоваться для входа в VPN
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Для получения данных доступа и чеков
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
                disabled={paying}
              >
                <Icon name="ArrowLeft" className="w-4 h-4 mr-2" />
                Назад
              </Button>
              <Button
                onClick={handlePayment}
                disabled={paying}
                className="flex-1"
              >
                {paying ? (
                  <>
                    <Icon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                    Создание платежа...
                  </>
                ) : (
                  <>
                    <Icon name="CreditCard" className="w-4 h-4 mr-2" />
                    Оплатить {Math.round(customPlan.price)} ₽
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payment;
