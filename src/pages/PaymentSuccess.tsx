import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import API_ENDPOINTS, { CDN_ASSETS } from '@/config/api';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [hasReferralBonus, setHasReferralBonus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'checking' | 'succeeded' | 'pending' | 'canceled' | 'failed'>('checking');

  useEffect(() => {
    const checkPayment = async () => {
      const savedUsername = localStorage.getItem('vpn_username') || '';
      const savedEmail = localStorage.getItem('vpn_email') || '';
      const paymentId = localStorage.getItem('vpn_payment_id') || '';
      
      setUsername(savedUsername);
      setEmail(savedEmail);
      
      if (!savedUsername || !paymentId) {
        navigate('/register');
        return;
      }

      // Проверяем статус платежа через наш backend
      try {
        const response = await fetch(`${API_ENDPOINTS.CHECK_PAYMENT_STATUS}?payment_id=${paymentId}`);
        const data = await response.json();
        
        if (data.status === 'succeeded') {
          setPaymentStatus('succeeded');
          setLoading(false);
        } else if (data.status === 'pending' || data.status === 'waiting_for_capture') {
          setPaymentStatus('pending');
          setLoading(false);
        } else if (data.status === 'canceled') {
          setPaymentStatus('canceled');
          setLoading(false);
          toast({
            title: "❌ Платеж отменен",
            description: "Вы отменили оплату. Попробуйте еще раз.",
            variant: "destructive"
          });
          setTimeout(() => navigate('/register'), 2000);
        } else {
          setPaymentStatus('failed');
          setLoading(false);
          toast({
            title: "⚠️ Ошибка платежа",
            description: "Что-то пошло не так. Попробуйте еще раз.",
            variant: "destructive"
          });
          setTimeout(() => navigate('/register'), 2000);
        }
      } catch (error) {
        console.error('Failed to check payment:', error);
        setPaymentStatus('failed');
        setLoading(false);
        toast({
          title: "⚠️ Ошибка проверки платежа",
          description: "Не удалось проверить статус платежа",
          variant: "destructive"
        });
      }
    };

    checkPayment();
  }, [navigate, toast]);

  useEffect(() => {
    if (paymentStatus !== 'succeeded') return;
    
    // Activate referral if exists - moved to separate effect
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
  }, [paymentStatus, toast]);

  const copyUsername = () => {
    navigator.clipboard.writeText(username);
    toast({
      title: "✅ Скопировано!",
      description: "Username скопирован в буфер обмена"
    });
  };

  if (loading || paymentStatus === 'checking') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Проверяем статус платежа...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStatus === 'pending') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
        <Card className="max-w-2xl w-full border-yellow-500">
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
            <CardTitle className="flex items-center gap-2 text-yellow-600 justify-center">
              <Icon name="Clock" className="w-8 h-8" />
              Ожидание оплаты
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                ⏳ Платеж создан, но еще не оплачен.
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Завершите оплату, чтобы активировать подписку.
              </p>
            </div>
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                <Icon name="RefreshCw" className="w-4 h-4 mr-2" />
                Обновить статус
              </Button>
              <Button 
                onClick={() => navigate('/register')} 
                variant="outline" 
                className="w-full"
              >
                <Icon name="ArrowLeft" className="w-4 h-4 mr-2" />
                Вернуться к регистрации
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStatus === 'canceled' || paymentStatus === 'failed') {
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
              {paymentStatus === 'canceled' ? 'Платеж отменен' : 'Ошибка оплаты'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                {paymentStatus === 'canceled' 
                  ? '❌ Вы отменили оплату. Попробуйте еще раз, чтобы активировать подписку.'
                  : '⚠️ Произошла ошибка при обработке платежа. Попробуйте еще раз.'
                }
              </p>
            </div>
            <Button 
              onClick={() => navigate('/register')} 
              className="w-full"
            >
              <Icon name="ArrowLeft" className="w-4 h-4 mr-2" />
              Вернуться к регистрации
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <Card className="max-w-2xl w-full border-green-500">
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
          <CardTitle className="flex items-center gap-2 text-green-600 justify-center">
            <Icon name="CheckCircle" className="w-8 h-8" />
            Оплата успешна!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✅ Платёж обработан успешно! Ваша подписка будет активирована в течение нескольких минут.
            </p>
          </div>

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