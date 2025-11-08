import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import API_ENDPOINTS, { CDN_ASSETS } from '@/config/api';
import { useNavigate } from 'react-router-dom';

const GetAccess = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRestoreAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (!email.trim()) {
      setError('Введите email');
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Введите корректный email адрес');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.RESTORE_ACCESS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });

      const data = await response.json();

      if (response.status === 404) {
        setError('На этот email не найдено оплаченных подписок. Проверьте email или оформите новую подписку.');
      } else if (!response.ok) {
        setError(data.error || 'Ошибка восстановления доступа');
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('Ошибка подключения к серверу. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <a href="/" className="transition-transform hover:scale-105">
              <img 
                src={CDN_ASSETS.LOGO} 
                alt="Speed VPN" 
                className="w-16 h-16 rounded-full object-cover border-2 border-primary"
              />
            </a>
          </div>
          <CardTitle className="flex items-center gap-2 justify-center">
            <Icon name="Key" className="w-6 h-6" />
            Восстановление доступа
          </CardTitle>
          <CardDescription>
            Введите email, который указывали при покупке
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!success ? (
            <form onSubmit={handleRestoreAccess} className="space-y-4">
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
                <p className="text-xs text-muted-foreground">
                  На этот email будут отправлены все ваши username
                </p>
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
                    Отправка...
                  </>
                ) : (
                  <>
                    <Icon name="Mail" className="w-4 h-4 mr-2" />
                    Отправить на email
                  </>
                )}
              </Button>

              <div className="pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/login')}
                >
                  <Icon name="ArrowLeft" className="w-4 h-4 mr-2" />
                  Назад к входу
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-md bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                <Icon name="CheckCircle" className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-green-900 dark:text-green-100">
                    Письмо отправлено! ✅
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    На адрес <strong>{email}</strong> отправлено письмо со всеми вашими username.
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Проверьте почту (возможно в папке "Спам")
                  </p>
                </div>
              </div>

              <Card className="bg-muted">
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Icon name="Info" className="w-4 h-4" />
                    Что дальше?
                  </h4>
                  <ol className="text-sm space-y-2 text-muted-foreground list-decimal list-inside">
                    <li>Откройте письмо от Speed VPN</li>
                    <li>Скопируйте любой из указанных username</li>
                    <li>Войдите в личный кабинет с этим username</li>
                  </ol>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button
                  onClick={() => navigate('/login')}
                  className="flex-1"
                >
                  <Icon name="LogIn" className="w-4 h-4 mr-2" />
                  Войти в кабинет
                </Button>
                <Button
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                    setError('');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <Icon name="RotateCcw" className="w-4 h-4 mr-2" />
                  Еще раз
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
