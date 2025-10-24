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
      const response = await fetch(
        `https://functions.poehali.dev/d8d680b3-23f3-481e-b8cf-ccb969e2f158?username=${username.trim()}`
      );

      if (!response.ok) {
        throw new Error('Пользователь не найден');
      }

      const data = await response.json();
      
      if (data.username) {
        localStorage.setItem('vpn_username', username.trim());
        navigate('/dashboard');
      } else {
        setError('Пользователь не найден');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка подключения');
    } finally {
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
            Введите ваше имя пользователя для доступа к подписке
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
              <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm">
                <Icon name="AlertCircle" className="w-4 h-4" />
                <span>{error}</span>
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

          <div className="mt-6 pt-6 border-t text-center">
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;