import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatusCard } from '@/components/dashboard/StatusCard';
import { ConnectionCard } from '@/components/dashboard/ConnectionCard';
import { VpnClients } from '@/components/dashboard/VpnClients';
import { PricingCard } from '@/components/dashboard/PricingCard';
import { PaymentHistory } from '@/components/dashboard/PaymentHistory';

interface UserData {
  username: string;
  email: string;
  status: string;
  used_traffic: number;
  data_limit: number;
  expire: number;
  sub_url: string;
}

interface Payment {
  payment_id: string;
  amount: number;
  plan_name: string;
  plan_days: number;
  status: string;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showHistory, setShowHistory] = useState(false);

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
      
      const response = await fetch(
        `https://functions.poehali.dev/c56efe3d-0219-4eab-a894-5d98f0549ef0?username=${username}`
      );
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить данные. Используйте страницу восстановления доступа.');
      }

      const data = await response.json();
      console.log('📊 Subscription data:', data);
      console.log('📊 Used traffic:', data.subscription?.used_traffic_bytes);
      console.log('📊 Traffic limit:', data.subscription?.traffic_limit_bytes);
      
      setUserData({
        username: data.username || username,
        email: data.payments?.[0]?.email || '',
        status: data.subscription?.is_active ? 'active' : 'expired',
        used_traffic: data.subscription?.used_traffic_bytes || 0,
        data_limit: data.subscription?.traffic_limit_bytes || 32212254720,
        expire: data.subscription?.expire_timestamp || 0,
        sub_url: data.subscription?.subscription_url || ''
      });
      
      setPayments(data.payments || []);
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
          email: userData.email || 'noemail@speedvpn.io',
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <DashboardHeader 
          username={userData.username} 
          onLogout={handleLogout} 
        />

        <StatusCard
          status={userData.status}
          expire={userData.expire}
          usedTraffic={userData.used_traffic}
          dataLimit={userData.data_limit}
          formatDate={formatDate}
          formatBytes={formatBytes}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
        />

        <ConnectionCard subUrl={userData.sub_url} />

        <VpnClients />

        <PricingCard 
          paymentLoading={paymentLoading}
          onPayment={handlePayment}
        />

        <PaymentHistory
          payments={payments}
          showHistory={showHistory}
          onToggleHistory={() => setShowHistory(!showHistory)}
        />
      </div>
    </div>
  );
};

export default Dashboard;
