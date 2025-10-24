import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [subscriptionLink, setSubscriptionLink] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    const checkPaymentAndActivate = async () => {
      // Получаем данные из URL параметров (после редиректа с YooKassa)
      const emailFromUrl = searchParams.get('email');
      const usernameFromUrl = searchParams.get('username');
      
      // Пытаемся получить из localStorage как fallback
      const email = emailFromUrl || localStorage.getItem('vpn_email');
      const username = usernameFromUrl || localStorage.getItem('vpn_username');
      
      if (!username || !email) {
        setError('Не найдены данные пользователя. Перейдите на страницу восстановления доступа.');
        setLoading(false);
        return;
      }
      
      // Сохраняем в localStorage и state
      localStorage.setItem('vpn_email', email);
      localStorage.setItem('vpn_username', username);
      setUserEmail(email);
      setUserName(username);

      try {
        // Сначала проверяем есть ли subscriptionUrl в localStorage (сохранен при регистрации)
        const cachedSubLink = localStorage.getItem('vpn_subscription_url');
        
        if (cachedSubLink) {
          console.log('✅ Использую сохраненную ссылку подписки:', cachedSubLink);
          setSubscriptionLink(cachedSubLink);
          setSuccess(true);
          
          // Отправляем email с данными доступа
          if (email && cachedSubLink) {
            try {
              await fetch('https://functions.poehali.dev/02f41dd7-0d1d-4506-828c-64a917a7dda7', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: email,
                  subscription_url: cachedSubLink,
                  username: username
                })
              });
            } catch (emailErr) {
              console.error('Failed to send email:', emailErr);
            }
          }
        } else {
          console.log('🔍 Запрашиваю данные для username:', username);
          
          // Пытаемся получить данные с несколькими попытками
          let userResponse;
          let attempts = 0;
          const maxAttempts = 3;
          
          while (attempts < maxAttempts) {
            userResponse = await fetch(
              `https://functions.poehali.dev/d8d680b3-23f3-481e-b8cf-ccb969e2f158?username=${username}`,
              {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
              }
            );

            console.log(`📡 Попытка ${attempts + 1}/${maxAttempts}, статус:`, userResponse.status);

            if (userResponse.ok) {
              break;
            }
            
            if (userResponse.status === 404 && attempts < maxAttempts - 1) {
              console.log('⏳ Пользователь не найден, жду 2 секунды...');
              await new Promise(resolve => setTimeout(resolve, 2000));
              attempts++;
              continue;
            }
            
            const errorText = await userResponse.text();
            console.error('❌ Ошибка от сервера:', errorText);
            throw new Error(`Ошибка получения данных пользователя: ${errorText}`);
          }

          const userData = await userResponse.json();
          console.log('✅ User data from Remnawave:', userData);
          
          const responseData = userData.response || userData;
          const subLink = responseData.subscriptionUrl || responseData.subscription_url || responseData.sub_url || userData.links?.[0] || '';
          
          if (!subLink) {
            console.error('No subscription URL found in response:', userData);
          }
          
          setSubscriptionLink(subLink);
          setSuccess(true);

          // Сохраняем ссылку на подписку
          if (subLink) {
            localStorage.setItem('vpn_subscription_url', subLink);
          }

          // Отправляем email с данными доступа
          if (email && subLink) {
            try {
              await fetch('https://functions.poehali.dev/02f41dd7-0d1d-4506-828c-64a917a7dda7', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: email,
                  subscription_url: subLink,
                  username: username
                })
              });
            } catch (emailErr) {
              console.error('Failed to send email:', emailErr);
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка активации');
      } finally {
        setLoading(false);
      }
    };

    checkPaymentAndActivate();
  }, [searchParams]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Скопировано!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Icon name="Loader2" className="w-12 h-12 animate-spin text-primary" />
              <p className="text-center text-muted-foreground">
                Проверяем оплату и активируем доступ...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full border-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Icon name="XCircle" className="w-6 h-6" />
              Ошибка
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/get-access')} className="w-full">
                Восстановить доступ
              </Button>
              <Button onClick={() => navigate('/register')} variant="outline" className="w-full">
                Вернуться к регистрации
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
        <Card className="max-w-2xl w-full border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Icon name="CheckCircle" className="w-8 h-8" />
              Оплата успешна!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✅ Ваша подписка активирована!
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Как подключиться:</h3>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Шаг 1:</strong> Скачайте приложение V2rayN (Windows) или V2rayNG (Android) или Streisand (iOS)
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Шаг 2:</strong> Скопируйте ссылку подписки ниже
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Шаг 3:</strong> В приложении добавьте подписку по ссылке
                </p>
              </div>
            </div>

            {subscriptionLink && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Ваша ссылка на подписку:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={subscriptionLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono"
                  />
                  <Button
                    onClick={() => copyToClipboard(subscriptionLink)}
                    variant="outline"
                    size="sm"
                  >
                    <Icon name="Copy" className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 Сохраните эту ссылку! Она понадобится для подключения на всех устройствах.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                onClick={async () => {
                  if (!userEmail || !subscriptionLink || !userName) return;
                  
                  setSendingEmail(true);
                  try {
                    await fetch('https://functions.poehali.dev/02f41dd7-0d1d-4506-828c-64a917a7dda7', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        email: userEmail,
                        subscription_url: subscriptionLink,
                        username: userName
                      })
                    });
                    alert('📧 Письмо отправлено! Проверьте почту.');
                  } catch (err) {
                    alert('Ошибка отправки письма. Попробуйте позже.');
                  } finally {
                    setSendingEmail(false);
                  }
                }}
                variant="outline"
                disabled={sendingEmail}
                className="w-full"
              >
                {sendingEmail ? (
                  <>
                    <Icon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Icon name="Mail" className="w-4 h-4 mr-2" />
                    Отправить инструкцию повторно
                  </>
                )}
              </Button>
              
              <Button onClick={() => navigate('/dashboard')} className="w-full button-glow">
                Перейти в личный кабинет
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default PaymentSuccess;