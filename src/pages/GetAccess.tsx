import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";

const GetAccess = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subscriptionUrl, setSubscriptionUrl] = useState('');
  const [username, setUsername] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleGetAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Введите корректный email');
      setLoading(false);
      return;
    }

    // Просто показываем инструкцию - реальная отправка email пока не работает
    // так как нужно интегрировать поиск пользователя в Marzban
    setTimeout(() => {
      setSubscriptionUrl('email_sent');
      setLoading(false);
    }, 800);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Ссылка скопирована!');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Key" className="w-6 h-6" />
            Восстановить доступ
          </CardTitle>
          <CardDescription>
            Найдите в письме с подтверждением оплаты ваш username и используйте его для входа
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!subscriptionUrl ? (
            <form onSubmit={handleGetAccess} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm">
                  <Icon name="AlertCircle" className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full button-glow">
                {loading ? (
                  <>
                    <Icon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                    Поиск...
                  </>
                ) : (
                  <>
                    <Icon name="Search" className="w-4 h-4 mr-2" />
                    Получить доступ
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <Icon name="Info" className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                      Как восстановить доступ:
                    </p>
                    <ol className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                      <li>Найдите письмо с подтверждением оплаты на <strong>{email}</strong></li>
                      <li>В письме найдите ваш <strong>username</strong> (например: pomytkinserdj_1761322601020)</li>
                      <li>Используйте его для входа в личный кабинет</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Не нашли письмо?</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Проверьте папку "Спам"</li>
                  <li>Письмо приходит с адреса onboarding@resend.dev</li>
                  <li>Тема письма: "Speed VPN - Ваша подписка активирована"</li>
                </ul>
              </div>

              <Button 
                onClick={() => window.location.href = '/login'}
                className="w-full button-glow"
              >
                <Icon name="LogIn" className="w-4 h-4 mr-2" />
                Войти с username
              </Button>

              <Button 
                onClick={() => {
                  setSubscriptionUrl('');
                  setEmail('');
                }} 
                variant="outline" 
                className="w-full"
              >
                <Icon name="ArrowLeft" className="w-4 h-4 mr-2" />
                Попробовать другой email
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GetAccess;