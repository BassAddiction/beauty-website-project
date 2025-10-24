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

  const handleGetAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSubscriptionUrl('');

    try {
      // Генерируем username из email (как при регистрации)
      const emailPrefix = email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '');
      
      // Ищем пользователей с этим префиксом
      const response = await fetch(
        `https://functions.poehali.dev/d8d680b3-23f3-481e-b8cf-ccb969e2f158?email_prefix=${emailPrefix}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (!response.ok) {
        throw new Error('Пользователь не найден. Убедитесь что вы оплатили подписку.');
      }

      const userData = await response.json();
      console.log('User data:', userData);
      
      const subUrl = userData.subscription_url || userData.sub_url || userData.links?.[0] || '';
      
      if (!subUrl) {
        throw new Error('Ссылка на подписку не найдена. Возможно подписка ещё не активирована.');
      }

      setSubscriptionUrl(subUrl);
      localStorage.setItem('vpn_subscription_url', subUrl);
      localStorage.setItem('vpn_email', email);

      // Отправляем email с данными доступа
      try {
        await fetch('https://functions.poehali.dev/02f41dd7-0d1d-4506-828c-64a917a7dda7', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            subscription_url: subUrl,
            username: emailPrefix
          })
        });
      } catch (emailErr) {
        console.error('Failed to send email:', emailErr);
        // Не показываем ошибку - email это бонус
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка получения доступа');
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
            Введите email который использовали при оплате
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
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg space-y-2">
                <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                  ✅ Доступ найден!
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  📧 Инструкция отправлена на {email}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Ваша ссылка на подписку:</Label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={subscriptionUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono"
                  />
                  <Button
                    onClick={() => copyToClipboard(subscriptionUrl)}
                    variant="outline"
                    size="sm"
                  >
                    <Icon name="Copy" className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <p className="font-medium">Как подключиться:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Скачайте V2rayN (Windows), V2rayNG (Android) или Streisand (iOS)</li>
                  <li>Скопируйте ссылку выше</li>
                  <li>Добавьте подписку в приложении</li>
                </ol>
              </div>

              <Button 
                onClick={() => {
                  setSubscriptionUrl('');
                  setEmail('');
                }} 
                variant="outline" 
                className="w-full"
              >
                Искать другой аккаунт
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GetAccess;