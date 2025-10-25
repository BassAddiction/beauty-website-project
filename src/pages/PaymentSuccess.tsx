import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const savedUsername = localStorage.getItem('vpn_username') || '';
    const savedEmail = localStorage.getItem('vpn_email') || '';
    setUsername(savedUsername);
    setEmail(savedEmail);
  }, []);

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
              ✅ Платёж обработан успешно! Ваша подписка будет активирована в течение нескольких минут.
            </p>
          </div>

          {username && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Данные вашей подписки:</h3>
              
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Username:</span>
                  <span className="font-mono font-bold">{username}</span>
                </div>
                {email && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Email:</span>
                    <span className="font-mono">{email}</span>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-2">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>📧 Важно!</strong> На ваш email <strong>{email}</strong> отправлена инструкция по подключению к VPN.
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Если письмо не пришло в течение 5 минут, проверьте папку "Спам".
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-semibold">Что дальше?</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Проверьте email — там инструкция и ссылка для подключения</li>
              <li>Скачайте VPN-клиент для вашего устройства</li>
              <li>Добавьте подписку по ссылке из письма</li>
              <li>Наслаждайтесь быстрым и безопасным интернетом! 🚀</li>
            </ol>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <Button 
              onClick={() => navigate('/get-access')} 
              className="w-full"
            >
              <Icon name="Key" className="w-4 h-4 mr-2" />
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
