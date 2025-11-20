import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import API_ENDPOINTS, { CDN_ASSETS } from '@/config/api';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  // КРИТИЧЕСКИ ВАЖНО: Проверяем username ДО рендера компонента
  const savedUsername = localStorage.getItem('vpn_username') || '';
  const savedEmail = localStorage.getItem('vpn_email') || '';
  
  const [username, setUsername] = useState(savedUsername);
  const [email, setEmail] = useState(savedEmail);
  const [hasReferralBonus, setHasReferralBonus] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'succeeded' | 'canceled' | 'pending'>('loading');
  const [isChecking, setIsChecking] = useState(false);

  console.log('🚀🚀🚀 PaymentSuccess v3.0 LOADED - username:', savedUsername, '🚀🚀🚀');

  useEffect(() => {
    console.log('🔄🔄🔄 useEffect v3.0 TRIGGERED - username:', savedUsername, '🔄🔄🔄');
    
    const checkPayment = async () => {
      if (!savedUsername) {
        console.log('⚠️ No username in localStorage, showing pending for testing');
        setPaymentStatus('pending');
        return;
      }
      
      try {
        console.log('📡 Checking last payment for username:', savedUsername);
        const url = `${API_ENDPOINTS.PAYMENT}?username=${encodeURIComponent(savedUsername)}`;
        console.log('📡 Request URL:', url);
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('✅ Payment API response:', data);
        console.log('📊 Payment status:', data.status);
        
        if (data.status === 'not_found') {
          console.log('⚠️ No payment found, showing pending');
          setPaymentStatus('pending');
          return;
        }
        
        // FORCE PENDING FOR TESTING
        console.log('🔧 FORCING PENDING STATUS FOR TESTING');
        setPaymentStatus('pending');
        
        if (data.status === 'canceled') {
          console.log('❌ Payment canceled, clearing data and redirecting');
          localStorage.removeItem('vpn_username');
          localStorage.removeItem('vpn_email');
          
          toast({
            title: "❌ Платёж отменён",
            description: "Оплата не была завершена. Попробуйте снова.",
            variant: "destructive",
            duration: 5000
          });
          
          setTimeout(() => navigate('/'), 3000);
          return;
        }
        
        if (data.status === 'pending') {
          toast({
            title: "⏳ Платёж в обработке",
            description: "Ожидаем подтверждение оплаты от банка.",
          });
        }
        
        if (data.status === 'succeeded') {
          console.log('✅ Payment succeeded');
        }
      } catch (err) {
        console.error('Failed to check payment status:', err);
        setPaymentStatus('succeeded');
      }
    };
    
    checkPayment();
    
    // Activate referral if exists
    const pendingReferral = localStorage.getItem('pending_referral');
    if (pendingReferral) {
      try {
        const { username: refUsername, referral_code } = JSON.parse(pendingReferral);
        
        fetch(API_ENDPOINTS.ACTIVATE_REFERRAL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: refUsername,
            referral_code
          })
        }).then(() => {
          localStorage.removeItem('pending_referral');
          localStorage.removeItem('referral_code');
          setHasReferralBonus(true);
          console.log('✅ Referral activated');
          
          toast({
            title: "🎉 Бонус начислен!",
            description: "Вы получили +7 дней к подписке за регистрацию по реферальной ссылке!",
            duration: 8000
          });
        }).catch(err => {
          console.error('Failed to activate referral:', err);
        });
      } catch (err) {
        console.error('Error processing referral:', err);
      }
    }
  }, [navigate, toast, savedUsername]);

  const copyUsername = () => {
    navigator.clipboard.writeText(username);
    toast({
      title: "✅ Скопировано!",
      description: "Username скопирован в буфер обмена"
    });
  };

  const forceCheckPayment = async () => {
    setIsChecking(true);
    try {
      const url = `${API_ENDPOINTS.PAYMENT}?username=${encodeURIComponent(savedUsername)}`;
      const response = await fetch(url);
      const data = await response.json();
      
      setPaymentStatus(data.status);
      
      if (data.status === 'pending') {
        toast({
          title: "⏳ Всё ещё в обработке",
          description: "Платёж ещё обрабатывается. Попробуйте через минуту.",
        });
      } else if (data.status === 'succeeded') {
        toast({
          title: "✅ Подтверждено!",
          description: "Платёж успешно подтверждён!",
        });
        window.location.reload();
      }
    } catch (err) {
      toast({
        title: "❌ Ошибка",
        description: "Не удалось проверить статус",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  if (paymentStatus === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
        <Card className="max-w-2xl w-full">
          <CardContent className="py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Проверяем статус платежа...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStatus === 'canceled') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
        <Card className="max-w-2xl w-full border-red-500">
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
            <CardTitle className="flex items-center gap-2 text-red-600 justify-center">
              <Icon name="XCircle" className="w-8 h-8" />
              Платёж отменён
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                ❌ Оплата не была завершена. Вы можете попробовать оплатить снова.
              </p>
            </div>
            <div className="space-y-3 pt-2">
              <Button 
                onClick={() => navigate('/')} 
                className="w-full"
              >
                <Icon name="Home" className="w-4 h-4 mr-2" />
                Вернуться на главную
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <Card className={`max-w-2xl w-full ${paymentStatus === 'pending' ? 'border-yellow-500' : 'border-green-500'}`}>
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
          <CardTitle className={`flex items-center gap-2 ${paymentStatus === 'pending' ? 'text-yellow-600' : 'text-green-600'} justify-center`}>
            <Icon name={paymentStatus === 'pending' ? 'Clock' : 'CheckCircle'} className="w-8 h-8" />
            {paymentStatus === 'pending' ? 'Платёж в обработке' : 'Оплата успешна!'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {paymentStatus === 'pending' ? (
            <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                ⏳ Ожидаем подтверждение оплаты от банка. Обычно это занимает 1-2 минуты.
              </p>
              <Button 
                onClick={forceCheckPayment} 
                disabled={isChecking}
                variant="outline"
                className="w-full"
              >
                {isChecking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Проверяем...
                  </>
                ) : (
                  <>
                    <Icon name="RefreshCw" className="w-4 h-4 mr-2" />
                    Проверить статус прямо сейчас
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✅ Платёж обработан успешно! Ваша подписка будет активирована в течение нескольких минут.
              </p>
            </div>
          )}

          {hasReferralBonus && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-700">
              <div className="flex items-start gap-3">
                <div className="text-3xl">🎁</div>
                <div>
                  <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                    Реферальный бонус начислен!
                  </p>
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    Вы получили <strong>+7 дней</strong> к подписке за регистрацию по реферальной ссылке. Приглашайте друзей и получайте ещё больше бонусов!
                  </p>
                </div>
              </div>
            </div>
          )}

          {username && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-2">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>📧 Важно!</strong> На ваш email <strong>{email}</strong> отправлена вся информация о регистрации и инструкция по подключению к VPN.
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Если письмо не пришло в течение 5 минут, проверьте папку "Спам".
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950/30 p-4 rounded-lg border-l-4 border-yellow-500">
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  ⚠️ Важно! Сохраните ваш Username в надёжном месте
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  Username потребуется для входа в личный кабинет и управления подпиской. Без него вы не сможете авторизоваться.
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-muted-foreground shrink-0">Username:</span>
                    <Button 
                      onClick={copyUsername}
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 shrink-0"
                    >
                      <Icon name="Copy" className="w-3 h-3 mr-1" />
                      Копировать
                    </Button>
                  </div>
                  <div className="font-mono font-bold text-sm break-all">{username}</div>
                </div>
                {email && (
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Email:</span>
                    <div className="font-mono text-sm break-all">{email}</div>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-6 rounded-lg border border-primary/20 text-center">
                <h3 className="font-bold text-xl mb-2">Авторизуйтесь в личном кабинете</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Используйте ваш Username для входа и получения инструкций по подключению
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <Button 
              onClick={() => navigate('/dashboard')} 
              className="w-full"
            >
              <Icon name="LayoutDashboard" className="w-4 h-4 mr-2" />
              Войти в личный кабинет
            </Button>
            <Button 
              onClick={() => navigate('/')} 
              variant="outline" 
              className="w-full"
            >
              <Icon name="Home" className="w-4 h-4 mr-2" />
              Вернуться на главную
            </Button>
          </div>

          <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground">
              Возникли проблемы? Напишите в поддержку: 
              <a href="https://t.me/gospeedvpn" target="_blank" rel="noopener noreferrer" className="text-primary ml-1">
                @gospeedvpn
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;