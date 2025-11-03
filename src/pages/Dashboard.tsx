import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatusCard } from '@/components/dashboard/StatusCard';
import { ConnectionCard } from '@/components/dashboard/ConnectionCard';
import { QuickClients } from '@/components/dashboard/QuickClients';
import { VpnClients } from '@/components/dashboard/VpnClients';
import { PricingCard } from '@/components/dashboard/PricingCard';
import { PaymentHistory } from '@/components/dashboard/PaymentHistory';
import { ReferralCard } from '@/components/dashboard/ReferralCard';
import PaymentMethodDialog from '@/components/PaymentMethodDialog';
import API_ENDPOINTS from '@/config/api';

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
  const [showPaymentMethodDialog, setShowPaymentMethodDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ id: number; name: string; price: number; days: number } | null>(null);
  const [showReferralBlock, setShowReferralBlock] = useState(false);

  useEffect(() => {
    const username = localStorage.getItem('vpn_username');
    if (!username) {
      navigate('/login');
      return;
    }

    fetchUserData(username);
    fetchBuilderSettings();
  }, [navigate]);

  const fetchBuilderSettings = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.GET_SUBSCRIPTION}?action=get_builder_settings`);
      const data = await response.json();
      setShowReferralBlock(data.settings?.show_referral_block || false);
    } catch (error) {
      console.error('Failed to load builder settings:', error);
    }
  };

  const fetchUserData = async (username: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `${API_ENDPOINTS.GET_SUBSCRIPTION}?username=${username}`
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

  const handlePayment = (plan: { id: number; name: string; price: number; days: number }) => {
    setSelectedPlan(plan);
    setShowPaymentMethodDialog(true);
  };

  const handleSelectPaymentMethod = async (method: 'sbp' | 'sberpay' | 'tpay') => {
    if (!userData || !selectedPlan) return;
    
    setShowPaymentMethodDialog(false);
    setPaymentLoading(true);
    
    try {
      const response = await fetch(API_ENDPOINTS.PAYMENT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'create_payment',
          username: userData.username,
          email: userData.email || 'noemail@speedvpn.io',
          amount: selectedPlan.price,
          plan_name: selectedPlan.name,
          plan_days: selectedPlan.days,
          plan_id: selectedPlan.id,
          payment_method: method,
          domain: window.location.hostname
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
      setShowPaymentMethodDialog(true);
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

        <QuickClients subUrl={userData.sub_url} />

        <VpnClients />

        <PricingCard 
          paymentLoading={paymentLoading}
          onPayment={handlePayment}
        />

        {showReferralBlock && <ReferralCard username={userData.username} />}

        <PaymentHistory
          payments={payments}
          showHistory={showHistory}
          onToggleHistory={() => setShowHistory(!showHistory)}
        />

        <PaymentMethodDialog
          open={showPaymentMethodDialog}
          onClose={() => setShowPaymentMethodDialog(false)}
          onSelectMethod={handleSelectPaymentMethod}
          loading={paymentLoading}
        />
      </div>
    </div>
  );
};

export default Dashboard;