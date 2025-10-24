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

    try {
      // Отправляем запрос на восстановление доступа
      const response = await fetch('https://functions.poehali.dev/02f41dd7-0d1d-4506-828c-64a917a7dda7', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          action: 'recover_access'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка отправки: ${errorText}`);
      }

      // Показываем успех
      setSubscriptionUrl('email_sent');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки письма. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
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
            Получить доступ к VPN
          </CardTitle>
          <CardDescription>
            Мы отправим вам ссылку на подписку и инструкции
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
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                      Инструкция отправлена!
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      Проверьте почту <strong>{email}</strong>
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      В письме вы найдёте ссылку на подписку и инструкции по подключению.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Не пришло письмо?</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Проверьте папку "Спам"</li>
                  <li>Подождите 2-3 минуты</li>
                  <li>Проверьте правильность email</li>
                </ul>
              </div>

              <Button 
                onClick={() => {
                  setSubscriptionUrl('');
                  setEmail('');
                }} 
                variant="outline" 
                className="w-full"
              >
                <Icon name="ArrowLeft" className="w-4 h-4 mr-2" />
                Попробовать снова
              </Button>

              <div className="pt-4 border-t">
                <Button 
                  onClick={() => window.location.href = '/register'}
                  className="w-full button-glow"
                >
                  <Icon name="UserPlus" className="w-4 h-4 mr-2" />
                  Создать новый аккаунт
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GetAccess;