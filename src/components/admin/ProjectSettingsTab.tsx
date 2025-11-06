import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import API_ENDPOINTS from '@/config/api';
import { DatabaseSettingsCard } from './settings/DatabaseSettingsCard';
import { YookassaSettingsCard } from './settings/YookassaSettingsCard';
import { RemnawaveSettingsCard } from './settings/RemnawaveSettingsCard';
import { EmailSettingsCard } from './settings/EmailSettingsCard';

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
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.SETTINGS_MANAGER, {
        headers: {
          'X-Admin-Password': adminPassword
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(API_ENDPOINTS.SETTINGS_MANAGER, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword
        },
        body: JSON.stringify({
          secrets: editedValues
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`✅ ${result.message}`);
        setEditMode(false);
        setEditedValues({});
        loadSettings();
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (error) {
      alert(`❌ Ошибка сохранения: ${error}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditedValues({});
  };

  const handleEdit = (key: string, value: string) => {
    setEditedValues({ ...editedValues, [key]: value });
  };

  const testConnection = async (service: string, data?: any) => {
    setTesting(service);
    setTestResults({ ...testResults, [service]: null });
    
    try {
      const response = await fetch(API_ENDPOINTS.SETTINGS_MANAGER, {
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Настройки проекта</h2>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="border-gray-600 text-gray-300"
                disabled={saving}
              >
                <Icon name="X" size={16} className="mr-2" />
                Отменить
              </Button>
              <Button
                onClick={handleSave}
                className="bg-cyan-600 hover:bg-cyan-700"
                disabled={saving || Object.keys(editedValues).length === 0}
              >
                {saving ? (
                  <Icon name="Loader2" className="animate-spin mr-2" size={16} />
                ) : (
                  <Icon name="Save" size={16} className="mr-2" />
                )}
                Сохранить
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setEditMode(true)}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Icon name="Edit" size={16} className="mr-2" />
              Редактировать
            </Button>
          )}
        </div>
      </div>

      <DatabaseSettingsCard
        databaseUrl={settings.database.url}
        editMode={editMode}
        editedValue={editedValues['DATABASE_URL']}
        testing={testing === 'database'}
        testResult={testResults.database}
        onEdit={(value) => handleEdit('DATABASE_URL', value)}
        onTest={() => testConnection('database')}
      />

      <YookassaSettingsCard
        shopId={settings.yookassa.shop_id}
        secretKeyMasked={settings.yookassa.secret_key_masked}
        editMode={editMode}
        editedShopId={editedValues['YOOKASSA_SHOP_ID']}
        editedSecretKey={editedValues['YOOKASSA_SECRET_KEY']}
        testing={testing === 'yookassa'}
        testResult={testResults.yookassa}
        onEditShopId={(value) => handleEdit('YOOKASSA_SHOP_ID', value)}
        onEditSecretKey={(value) => handleEdit('YOOKASSA_SECRET_KEY', value)}
        onTest={() => testConnection('yookassa')}
      />

      <RemnawaveSettingsCard
        apiUrl={settings.remnawave.api_url}
        apiTokenMasked={settings.remnawave.api_token_masked}
        functionUrl={settings.remnawave.function_url}
        squadUuids={settings.remnawave.squad_uuids}
        trafficLimitGb={settings.remnawave.traffic_limit_gb}
        trafficStrategy={settings.remnawave.traffic_strategy}
        editMode={editMode}
        editedApiUrl={editedValues['REMNAWAVE_API_URL']}
        editedApiToken={editedValues['REMNAWAVE_API_TOKEN']}
        editedFunctionUrl={editedValues['REMNAWAVE_FUNCTION_URL']}
        editedSquadUuids={editedValues['USER_SQUAD_UUIDS']}
        editedTrafficLimit={editedValues['USER_TRAFFIC_LIMIT_GB']}
        editedTrafficStrategy={editedValues['USER_TRAFFIC_STRATEGY']}
        testing={testing === 'remnawave'}
        testResult={testResults.remnawave}
        onEditApiUrl={(value) => handleEdit('REMNAWAVE_API_URL', value)}
        onEditApiToken={(value) => handleEdit('REMNAWAVE_API_TOKEN', value)}
        onEditFunctionUrl={(value) => handleEdit('REMNAWAVE_FUNCTION_URL', value)}
        onEditSquadUuids={(value) => handleEdit('USER_SQUAD_UUIDS', value)}
        onEditTrafficLimit={(value) => handleEdit('USER_TRAFFIC_LIMIT_GB', value)}
        onEditTrafficStrategy={(value) => handleEdit('USER_TRAFFIC_STRATEGY', value)}
        onTest={() => testConnection('remnawave')}
      />

      <EmailSettingsCard
        resendApiKeyMasked={settings.email.resend_api_key_masked}
        unisenderApiKeyMasked={settings.email.unisender_api_key_masked}
        editMode={editMode}
        editedResendKey={editedValues['RESEND_API_KEY']}
        editedUnisenderKey={editedValues['UNISENDER_API_KEY']}
        onEditResendKey={(value) => handleEdit('RESEND_API_KEY', value)}
        onEditUnisenderKey={(value) => handleEdit('UNISENDER_API_KEY', value)}
      />

      {editMode && (
        <Card className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border-amber-700/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Icon name="AlertTriangle" size={24} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="text-white font-semibold">Режим редактирования</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Изменения сохраняются в базе данных проекта</li>
                  <li>• Новые значения будут использоваться вместо переменных окружения</li>
                  <li>• Для отмены введите пустое значение и сохраните</li>
                  <li>• Замаскированные поля: введите новое значение полностью</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!editMode && (
        <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-700/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={24} className="text-cyan-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="text-white font-semibold">Управление настройками</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Нажмите "Редактировать" для изменения значений</li>
                  <li>• Кнопка "Тест" проверяет работоспособность подключений</li>
                  <li>• Все ключи отображаются в замаскированном виде для безопасности</li>
                  <li>• Значения хранятся в зашифрованном виде в базе данных</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
