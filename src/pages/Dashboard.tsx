import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useNavigate } from 'react-router-dom';

interface UserData {
  username: string;
  status: string;
  used_traffic: number;
  data_limit: number;
  expire: number;
  sub_url: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const username = localStorage.getItem('vpn_username');
    if (!username) {
      navigate('/login');
      return;
    }

    fetchUserData(username);
  }, [navigate]);

  const fetchUserData = async (username: string) => {
    try {
      setLoading(true);
      
      // Всегда получаем актуальные данные с сервера
      const response = await fetch(
        `https://functions.poehali.dev/c56efe3d-0219-4eab-a894-5d98f0549ef0?username=${username}`
      );
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить данные. Используйте страницу восстановления доступа.');
      }

      const data = await response.json();
      console.log('📊 Subscription data:', data);
      
      setUserData({
        username: data.username || username,
        status: data.subscription?.is_active ? 'active' : 'expired',
        used_traffic: 0,
        data_limit: 32212254720,
        expire: data.subscription?.expire_timestamp || 0,
        sub_url: data.subscription?.subscription_url || ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('vpn_username');
    navigate('/login');
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 GB';
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('ru-RU');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'limited': return 'bg-yellow-500';
      case 'expired': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активна';
      case 'limited': return 'Ограничена';
      case 'expired': return 'Истекла';
      default: return status;
    }
  };

  const handlePayment = async (plan: { name: string; price: number; days: number }) => {
    if (!userData) return;
    
    setPaymentLoading(true);
    
    try {
      const response = await fetch('https://functions.poehali.dev/1cd4e8c8-3e41-470f-a824-9c8dd42b6c9c', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'create_payment',
          username: userData.username,
          amount: plan.price,
          plan_name: plan.name,
          plan_days: plan.days
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка создания платежа');
      }

      const data = await response.json();
      
      if (data.confirmation_url) {
        window.location.href = data.confirmation_url;
      } else {
        throw new Error('Не получена ссылка на оплату');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка при создании платежа');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Ошибка</CardTitle>
            <CardDescription>{error || 'Не удалось загрузить данные'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/login')} className="w-full">
              Вернуться к входу
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const usagePercent = userData.data_limit > 0 
    ? (userData.used_traffic / userData.data_limit) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Личный кабинет</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-muted-foreground">Ваш username:</p>
              <code className="px-2 py-1 bg-muted rounded text-sm font-mono">{userData.username}</code>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(userData.username);
                  alert('Username скопирован!');
                }}
              >
                <Icon name="Copy" className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <Icon name="LogOut" className="w-4 h-4 mr-2" />
            Выход
          </Button>
        </div>

        {/* Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Статус подписки</CardTitle>
                <CardDescription>Информация о вашем тарифе</CardDescription>
              </div>
              <Badge className={getStatusColor(userData.status)}>
                {getStatusText(userData.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="Calendar" className="w-4 h-4" />
                  <span>Действует до</span>
                </div>
                <p className="text-2xl font-bold">{formatDate(userData.expire)}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="HardDrive" className="w-4 h-4" />
                  <span>Использовано</span>
                </div>
                <p className="text-2xl font-bold">
                  {formatBytes(userData.used_traffic)} / {formatBytes(userData.data_limit)}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Использование трафика</span>
                <span>{usagePercent.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    usagePercent > 90 ? 'bg-red-500' : 
                    usagePercent > 70 ? 'bg-yellow-500' : 
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connection Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Настройка подключения</CardTitle>
            <CardDescription>Скопируйте ссылку для подключения в VPN-клиент</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={userData.sub_url}
                className="flex-1 px-4 py-2 rounded-md border bg-secondary text-sm font-mono"
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(userData.sub_url);
                }}
              >
                <Icon name="Copy" className="w-4 h-4 mr-2" />
                Копировать
              </Button>
            </div>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Icon name="Info" className="w-4 h-4 mt-0.5" />
              <p>Вставьте эту ссылку в настройки вашего VPN-клиента для подключения</p>
            </div>
          </CardContent>
        </Card>

        {/* VPN Clients Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>VPN-Клиенты</CardTitle>
            <CardDescription>Рекомендуемые приложения для подключения</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Happ */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img 
                    src="https://cdn.poehali.dev/files/ef467f96-b43a-4159-b874-f59e2545f7d7.png" 
                    alt="Happ" 
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">Happ</h3>
                    <p className="text-sm text-muted-foreground">Простой и удобный клиент</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full rounded-full" asChild>
                    <a href="https://play.google.com/store/apps/details?id=com.happproxy" target="_blank" rel="noopener noreferrer">
                      <Icon name="Smartphone" size={18} className="mr-2" />
                      Play Market
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full rounded-full" asChild>
                    <a href="https://apps.apple.com/ru/app/happ-proxy-utility-plus/id6746188973?platform=iphone" target="_blank" rel="noopener noreferrer">
                      <Icon name="Apple" size={18} className="mr-2" />
                      App Store
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full rounded-full" asChild>
                    <a href="https://github.com/hiddify/hiddify-next/releases" target="_blank" rel="noopener noreferrer">
                      <Icon name="Monitor" size={18} className="mr-2" />
                      Windows
                    </a>
                  </Button>
                </div>
              </div>

              {/* V2RayTun */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img 
                    src="https://cdn.poehali.dev/files/063411ec-f9b3-487a-aeb1-e5717cf643c4.png" 
                    alt="V2RayTun" 
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">V2RayTun</h3>
                    <p className="text-sm text-muted-foreground">Мощный клиент с настройками</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full rounded-full" asChild>
                    <a href="https://play.google.com/store/apps/details?id=com.v2raytun.android" target="_blank" rel="noopener noreferrer">
                      <Icon name="Smartphone" size={18} className="mr-2" />
                      Play Market
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full rounded-full" asChild>
                    <a href="https://apps.apple.com/app/v2box-v2ray-client/id6446814690" target="_blank" rel="noopener noreferrer">
                      <Icon name="Apple" size={18} className="mr-2" />
                      App Store
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full rounded-full" asChild>
                    <a href="https://github.com/2dust/v2rayN/releases" target="_blank" rel="noopener noreferrer">
                      <Icon name="Monitor" size={18} className="mr-2" />
                      Windows
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Plans */}
        <Card>
          <CardHeader>
            <CardTitle>Продлить подписку</CardTitle>
            <CardDescription>Выберите подходящий тариф</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: '1 месяц', price: 200, days: 30, traffic: 30 },
                { name: '3 месяца', price: 500, days: 90, traffic: 30 },
                { name: '6 месяцев', price: 900, days: 180, traffic: 30 }
              ].map((plan) => (
                <Card key={plan.name} className="border-2 hover:border-primary transition-colors">
                  <CardHeader>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <CardDescription>
                      <span className="text-3xl font-bold text-foreground">{plan.price}₽</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Icon name="Check" className="w-4 h-4 text-green-500" />
                        <span>{plan.traffic} ГБ/сутки</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="Check" className="w-4 h-4 text-green-500" />
                        <span>{plan.days} дней</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="Check" className="w-4 h-4 text-green-500" />
                        <span>Любые локации</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => handlePayment(plan)}
                      disabled={paymentLoading}
                    >
                      {paymentLoading ? (
                        <>
                          <Icon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                          Загрузка...
                        </>
                      ) : (
                        'Оплатить'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;