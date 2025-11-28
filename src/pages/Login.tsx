import { useState } from 'react';
import { useSEO } from "@/hooks/useSEO";
import { pageSEO } from "@/utils/seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { useNavigate } from 'react-router-dom';
import API_ENDPOINTS, { CDN_ASSETS } from '@/config/api';

const AUTH_CHECK_URL = API_ENDPOINTS.AUTH_CHECK;

const Login = () => {
  const seoComponent = useSEO(pageSEO.login);
  
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
      console.log('🔐 [User Login] Checking IP block status...');
      
      // Проверяем, не заблокирован ли IP для пользовательских логинов
      const checkResponse = await fetch(AUTH_CHECK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check', login_type: 'user' })
      });

      console.log('🔐 [User Login] IP check response:', checkResponse.status);

      if (checkResponse.status === 429) {
        const checkData = await checkResponse.json();
        console.log('🚫 [User Login] IP is blocked!', checkData);
        setError(checkData.message || 'Слишком много попыток. Попробуйте позже.');
        setLoading(false);
        return;
      }

      console.log('🔐 [User Login] Checking user existence...');
      
      // Проверяем существование пользователя через API
      const response = await fetch(
        `${API_ENDPOINTS.GET_SUBSCRIPTION}?username=${encodeURIComponent(username.trim())}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      
      console.log('🔐 [User Login] User check response:', response.status);

      if (response.status === 404 || !response.ok) {
        console.log('❌ [User Login] User not found - recording failed attempt');
        
        // Записываем неудачную попытку
        await fetch(AUTH_CHECK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'record', 
            username: username.trim(),
            success: false,
            login_type: 'user'
          })
        });

        console.log('🔐 [User Login] Rechecking IP block status after failed attempt...');
        
        // Проверяем, не заблокирован ли IP после этой попытки
        const recheckResponse = await fetch(AUTH_CHECK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'check', login_type: 'user' })
        });

        console.log('🔐 [User Login] Recheck response:', recheckResponse.status);

        if (recheckResponse.status === 429) {
          const recheckData = await recheckResponse.json();
          console.log('🚫 [User Login] IP now blocked after this attempt!', recheckData);
          setError(recheckData.message || 'Слишком много неудачных попыток!');
        } else {
          console.log('⚠️ [User Login] Wrong username, but not blocked yet');
          setError(data.error || 'Пользователь не найден. Проверьте правильность username.');
        }
        
        setLoading(false);
        return;
      }

      if (data.username) {
        console.log('✅ [User Login] Login successful - recording success');
        
        // Записываем успешную попытку
        await fetch(AUTH_CHECK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'record', 
            username: username.trim(),
            success: true,
            login_type: 'user'
          })
        });
        
        // Пользователь найден - сохраняем и переходим в кабинет
        localStorage.setItem('vpn_username', username.trim());
        navigate('/dashboard');
      } else {
        console.log('❌ [User Login] No username in response');
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
    <>
      {seoComponent}
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <a href="/" className="transition-transform hover:scale-105">
              <img 
                src={CDN_ASSETS.LOGO} 
                alt="Speed VPN" 
                className="w-20 h-20 rounded-full object-cover border-2 border-primary"
              />
            </a>
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
    </>
  );
};

export default Login;