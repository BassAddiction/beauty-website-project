import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const savedUsername = localStorage.getItem('vpn_username') || '';
    const savedEmail = localStorage.getItem('vpn_email') || '';
    setUsername(savedUsername);
    setEmail(savedEmail);
    
    if (!savedUsername) {
      navigate('/?payment=success');
    }
  }, [navigate]);

  const copyUsername = () => {
    navigator.clipboard.writeText(username);
    toast({
      title: "✅ Скопировано!",
      description: "Username скопирован в буфер обмена"
    });
  };

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
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">Username:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm">{username}</span>
                    <Button 
                      onClick={copyUsername}
                      size="sm"
                      variant="outline"
                      className="h-8 px-3"
                    >
                      <Icon name="Copy" className="w-3 h-3 mr-1" />
                      Копировать
                    </Button>
                  </div>
                </div>
                {email && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Email:</span>
                    <span className="font-mono text-sm">{email}</span>
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