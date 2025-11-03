import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';

interface ProjectSettingsTabProps {
  adminPassword: string;
}

interface Settings {
  database: {
    url: string;
    status: string;
  };
  yookassa: {
    shop_id: string;
    secret_key_masked: string;
    has_secret: boolean;
  };
  remnawave: {
    api_url: string;
    api_token_masked: string;
    has_token: boolean;
    function_url: string;
    squad_uuids: string;
    traffic_limit_gb: string;
    traffic_strategy: string;
  };
  email: {
    resend_api_key_masked: string;
    has_resend: boolean;
    unisender_api_key_masked: string;
    has_unisender: boolean;
  };
}

export function ProjectSettingsTab({ adminPassword }: ProjectSettingsTabProps) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  const SETTINGS_API = 'https://functions.poehali.dev/5375b8f5-5979-4f46-b106-9c9ca07e2da6';

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    console.log('🔧 Загружаю настройки проекта...', { api: SETTINGS_API, password: adminPassword ? 'есть' : 'нет' });
    try {
      const response = await fetch(SETTINGS_API, {
        headers: {
          'X-Admin-Password': adminPassword
        }
      });
      
      console.log('📡 Ответ сервера:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Настройки загружены:', data);
        setSettings(data);
      } else {
        const errorText = await response.text();
        console.error('❌ Ошибка от сервера:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки настроек:', error);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (service: string, data?: any) => {
    setTesting(service);
    setTestResults({ ...testResults, [service]: null });
    
    try {
      const response = await fetch(SETTINGS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword
        },
        body: JSON.stringify({
          action: `test_${service}`,
          ...data
        })
      });
      
      const result = await response.json();
      setTestResults({ ...testResults, [service]: result });
    } catch (error) {
      setTestResults({ 
        ...testResults, 
        [service]: { 
          success: false, 
          message: `Ошибка: ${error}` 
        } 
      });
    } finally {
      setTesting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader2" className="animate-spin text-cyan-400" size={32} />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Не удалось загрузить настройки</p>
        <Button onClick={loadSettings} className="mt-4">
          Повторить попытку
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Icon name="Database" size={24} />
            База данных PostgreSQL
          </CardTitle>
          <CardDescription>
            Подключение к базе данных проекта
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-gray-300">DATABASE_URL</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="password"
                value={settings.database.url}
                readOnly
                className="bg-zinc-800 border-zinc-700 text-gray-300 font-mono text-sm"
              />
              <Button
                onClick={() => testConnection('database')}
                disabled={testing === 'database'}
                variant="outline"
                className="border-cyan-600 text-cyan-400 hover:bg-cyan-600/10"
              >
                {testing === 'database' ? (
                  <Icon name="Loader2" className="animate-spin" size={20} />
                ) : (
                  <Icon name="TestTube" size={20} />
                )}
              </Button>
            </div>
          </div>
          
          {testResults.database && (
            <div className={`p-3 rounded-lg border ${
              testResults.database.success 
                ? 'bg-green-500/10 border-green-500/50 text-green-400' 
                : 'bg-red-500/10 border-red-500/50 text-red-400'
            }`}>
              <div className="flex items-start gap-2">
                <Icon 
                  name={testResults.database.success ? 'CheckCircle' : 'XCircle'} 
                  size={20} 
                  className="mt-0.5"
                />
                <div>
                  <p className="font-medium">{testResults.database.message}</p>
                  {testResults.database.version && (
                    <p className="text-sm opacity-80 mt-1">{testResults.database.version}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <p className="text-sm text-gray-500">
            💡 Для изменения DATABASE_URL обратитесь к разработчику или измените секрет в настройках проекта
          </p>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Icon name="CreditCard" size={24} />
            ЮKassa (Платежи)
          </CardTitle>
          <CardDescription>
            Настройки приёма платежей через ЮKassa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-gray-300">Shop ID</Label>
            <Input
              type="text"
              value={settings.yookassa.shop_id}
              readOnly
              className="bg-zinc-800 border-zinc-700 text-gray-300 font-mono text-sm mt-2"
            />
          </div>
          
          <div>
            <Label className="text-gray-300">Secret Key</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="password"
                value={settings.yookassa.secret_key_masked}
                readOnly
                className="bg-zinc-800 border-zinc-700 text-gray-300 font-mono text-sm"
              />
              <Button
                onClick={() => testConnection('yookassa')}
                disabled={testing === 'yookassa'}
                variant="outline"
                className="border-cyan-600 text-cyan-400 hover:bg-cyan-600/10"
              >
                {testing === 'yookassa' ? (
                  <Icon name="Loader2" className="animate-spin" size={20} />
                ) : (
                  <Icon name="TestTube" size={20} />
                )}
              </Button>
            </div>
          </div>
          
          {testResults.yookassa && (
            <div className={`p-3 rounded-lg border ${
              testResults.yookassa.success 
                ? 'bg-green-500/10 border-green-500/50 text-green-400' 
                : 'bg-red-500/10 border-red-500/50 text-red-400'
            }`}>
              <div className="flex items-start gap-2">
                <Icon 
                  name={testResults.yookassa.success ? 'CheckCircle' : 'XCircle'} 
                  size={20} 
                  className="mt-0.5"
                />
                <div>
                  <p className="font-medium">{testResults.yookassa.message}</p>
                  {testResults.yookassa.shop_id && (
                    <p className="text-sm opacity-80 mt-1">Shop ID: {testResults.yookassa.shop_id}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <p className="text-sm text-gray-500">
            💡 Получите ключи в <a href="https://yookassa.ru/my/merchant/integration/api-keys" target="_blank" rel="noopener" className="text-cyan-400 hover:underline">личном кабинете ЮKassa</a>
          </p>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Icon name="Shield" size={24} />
            Remnawave (VPN Панель)
          </CardTitle>
          <CardDescription>
            Подключение к панели управления VPN
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-gray-300">API URL</Label>
            <Input
              type="text"
              value={settings.remnawave.api_url}
              readOnly
              className="bg-zinc-800 border-zinc-700 text-gray-300 font-mono text-sm mt-2"
            />
          </div>
          
          <div>
            <Label className="text-gray-300">API Token</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="password"
                value={settings.remnawave.api_token_masked}
                readOnly
                className="bg-zinc-800 border-zinc-700 text-gray-300 font-mono text-sm"
              />
              <Button
                onClick={() => testConnection('remnawave')}
                disabled={testing === 'remnawave'}
                variant="outline"
                className="border-cyan-600 text-cyan-400 hover:bg-cyan-600/10"
              >
                {testing === 'remnawave' ? (
                  <Icon name="Loader2" className="animate-spin" size={20} />
                ) : (
                  <Icon name="TestTube" size={20} />
                )}
              </Button>
            </div>
          </div>
          
          <Separator className="bg-zinc-800" />
          
          <div>
            <Label className="text-gray-300">Function URL</Label>
            <Input
              type="text"
              value={settings.remnawave.function_url}
              readOnly
              className="bg-zinc-800 border-zinc-700 text-gray-300 font-mono text-sm mt-2"
            />
          </div>
          
          <div>
            <Label className="text-gray-300">Squad UUIDs</Label>
            <Input
              type="text"
              value={settings.remnawave.squad_uuids}
              readOnly
              className="bg-zinc-800 border-zinc-700 text-gray-300 font-mono text-sm mt-2"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Лимит трафика (GB)</Label>
              <Input
                type="text"
                value={settings.remnawave.traffic_limit_gb}
                readOnly
                className="bg-zinc-800 border-zinc-700 text-gray-300 font-mono text-sm mt-2"
              />
            </div>
            <div>
              <Label className="text-gray-300">Стратегия сброса</Label>
              <Input
                type="text"
                value={settings.remnawave.traffic_strategy}
                readOnly
                className="bg-zinc-800 border-zinc-700 text-gray-300 font-mono text-sm mt-2"
              />
            </div>
          </div>
          
          {testResults.remnawave && (
            <div className={`p-3 rounded-lg border ${
              testResults.remnawave.success 
                ? 'bg-green-500/10 border-green-500/50 text-green-400' 
                : 'bg-red-500/10 border-red-500/50 text-red-400'
            }`}>
              <div className="flex items-start gap-2">
                <Icon 
                  name={testResults.remnawave.success ? 'CheckCircle' : 'XCircle'} 
                  size={20} 
                  className="mt-0.5"
                />
                <div>
                  <p className="font-medium">{testResults.remnawave.message}</p>
                  {testResults.remnawave.api_url && (
                    <p className="text-sm opacity-80 mt-1">{testResults.remnawave.api_url}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Icon name="Mail" size={24} />
            Email сервисы
          </CardTitle>
          <CardDescription>
            Настройки отправки email уведомлений
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-gray-300">Resend API Key</Label>
            <Input
              type="password"
              value={settings.email.resend_api_key_masked}
              readOnly
              className="bg-zinc-800 border-zinc-700 text-gray-300 font-mono text-sm mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              {settings.email.has_resend ? '✅ Настроен' : '❌ Не настроен'}
            </p>
          </div>
          
          <div>
            <Label className="text-gray-300">Unisender API Key</Label>
            <Input
              type="password"
              value={settings.email.unisender_api_key_masked}
              readOnly
              className="bg-zinc-800 border-zinc-700 text-gray-300 font-mono text-sm mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              {settings.email.has_unisender ? '✅ Настроен' : '❌ Не настроен'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-700/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Icon name="Info" size={24} className="text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="text-white font-semibold">Как изменить настройки?</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Секреты хранятся в защищённом хранилище проекта</li>
                <li>• Для изменения обратитесь к разработчику или используйте панель управления проектом</li>
                <li>• Кнопка "Тест" проверяет работоспособность подключений</li>
                <li>• Все ключи отображаются в замаскированном виде для безопасности</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}