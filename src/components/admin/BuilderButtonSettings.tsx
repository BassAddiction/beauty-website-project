import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";

interface BuilderButtonSettingsProps {
  adminPassword: string;
}

interface BuilderSettings {
  show_on_register: boolean;
  show_on_pricing: boolean;
}

const BuilderButtonSettings = ({ adminPassword }: BuilderButtonSettingsProps) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<BuilderSettings>({
    show_on_register: true,
    show_on_pricing: true
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const API_URL = 'https://functions.poehali.dev/c56efe3d-0219-4eab-a894-5d98f0549ef0';

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=get_builder_settings`, {
        headers: {
          'X-Admin-Password': adminPassword
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (error) {
      console.error('Load settings error:', error);
      toast({
        title: '❌ Ошибка загрузки',
        description: 'Не удалось загрузить настройки',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword
        },
        body: JSON.stringify({
          action: 'update_builder_settings',
          settings
        })
      });

      if (response.ok) {
        toast({
          title: '✅ Сохранено',
          description: 'Настройки кнопки конструктора обновлены'
        });
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      toast({
        title: '❌ Ошибка сохранения',
        description: String(error),
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (adminPassword) {
      loadSettings();
    }
  }, [adminPassword]);

  return (
    <Card className="border-2 border-purple-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Settings" className="w-5 h-5 text-purple-500" />
              Кнопка "Создать свой тариф"
            </CardTitle>
            <CardDescription>
              Управление отображением кнопки конструктора подписок
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
            <Icon name="Wrench" className="w-3 h-3 mr-1" />
            Конструктор
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Icon name="Loader2" className="w-6 h-6 animate-spin text-purple-500" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <Label htmlFor="show-register" className="text-base font-medium cursor-pointer">
                    Страница регистрации
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Показывать кнопку на странице выбора тарифа при регистрации
                  </p>
                </div>
                <Switch
                  id="show-register"
                  checked={settings.show_on_register}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, show_on_register: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <Label htmlFor="show-pricing" className="text-base font-medium cursor-pointer">
                    Страница тарифов (Pricing)
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Показывать кнопку на главной странице с тарифами
                  </p>
                </div>
                <Switch
                  id="show-pricing"
                  checked={settings.show_on_pricing}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, show_on_pricing: checked })
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t">
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="flex-1 bg-purple-500 hover:bg-purple-600"
              >
                {saving ? (
                  <>
                    <Icon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Icon name="Save" className="w-4 h-4 mr-2" />
                    Сохранить настройки
                  </>
                )}
              </Button>
              <Button 
                onClick={loadSettings} 
                variant="outline"
                disabled={loading}
              >
                <Icon name="RefreshCw" className="w-4 h-4" />
              </Button>
            </div>

            <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon name="Info" className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-purple-500">
                    Как работает конструктор
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Кнопка позволяет пользователям собирать подписку из отдельных локаций с гибкими настройками срока и трафика для каждой страны.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BuilderButtonSettings;
