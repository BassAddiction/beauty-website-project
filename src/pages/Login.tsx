import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Введите имя пользователя');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Проверяем существование пользователя через API
      const response = await fetch(
        `https://functions.poehali.dev/c56efe3d-0219-4eab-a894-5d98f0549ef0?username=${encodeURIComponent(username.trim())}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (response.status === 404 || !response.ok) {
        // Пользователь не найден
        setError(data.error || 'Пользователь не найден. Проверьте правильность username.');
        setLoading(false);
        return;
      }

      if (data.username) {
        // Пользователь найден - сохраняем и переходим в кабинет
        localStorage.setItem('vpn_username', username.trim());
        navigate('/dashboard');
      } else {
        setError('Пользователь не найден. Проверьте правильность username.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Ошибка проверки данных. Попробуйте позже.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="https://cdn.poehali.dev/files/299c507f-f10f-4048-a927-9fa71def332e.jpg" 
              alt="Speed VPN" 
              className="w-20 h-20 rounded-full object-cover border-2 border-primary"
            />
          </div>
          <CardTitle className="text-2xl">Вход в личный кабинет</CardTitle>
          <CardDescription>
            Введите имя пользователя из письма с подтверждением оплаты
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Имя пользователя</Label>
              <Input
                id="username"
                type="text"
                placeholder="Введите username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="text-base"
              />
            </div>

            {error && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm">
                  <Icon name="AlertCircle" className="w-4 h-4" />
                  <span>{error}</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-sm">
                  <Icon name="HelpCircle" className="w-4 h-4" />
                  <span>
                    Забыли username?{' '}
                    <button 
                      type="button"
                      onClick={() => navigate('/get-access')}
                      className="underline font-medium hover:no-underline"
                    >
                      Восстановите доступ по email
                    </button>
                  </span>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Icon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                  Проверка...
                </>
              ) : (
                <>
                  <Icon name="LogIn" className="w-4 h-4 mr-2" />
                  Войти
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t space-y-3">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate('/get-access')}
            >
              <Icon name="Key" className="w-4 h-4 mr-2" />
              Восстановить доступ по email
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Еще нет аккаунта?
              </p>
              <Button className="w-full button-glow" asChild>
                <a href="/register">
                  <Icon name="UserPlus" className="w-4 h-4 mr-2" />
                  Создать аккаунт
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;