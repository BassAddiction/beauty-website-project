import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import API_ENDPOINTS from '@/config/api';
import { useToast } from "@/hooks/use-toast";

interface ThemeSettingsTabProps {
  adminPassword: string;
}

export const ThemeSettingsTab = ({ adminPassword }: ThemeSettingsTabProps) => {
  const [loading, setLoading] = useState(false);
  const [newYearTheme, setNewYearTheme] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.SITE_SETTINGS}?key=new_year_theme`);
      if (response.ok) {
        const data = await response.json();
        setNewYearTheme(data.value === 'true');
      }
    } catch (error) {
      console.error('Error loading theme settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTheme = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.SITE_SETTINGS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword
        },
        body: JSON.stringify({
          key: 'new_year_theme',
          value: String(!newYearTheme)
        })
      });

      if (response.ok) {
        setNewYearTheme(!newYearTheme);
        toast({
          title: newYearTheme ? '❄️ Новогодняя тема выключена' : '🎄 Новогодняя тема включена',
          description: newYearTheme 
            ? 'Сайт вернулся к обычному оформлению' 
            : 'Сайт украшен к Новому году!',
        });
      }
    } catch (error) {
      toast({
        title: '❌ Ошибка',
        description: String(error),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !newYearTheme) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader2" className="animate-spin text-white" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Оформление сайта</h2>

      <Card className="p-6 bg-slate-800 border-slate-700">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-red-500 rounded-lg flex items-center justify-center">
                <Icon name="Sparkles" size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Новогоднее оформление</h3>
                <p className="text-sm text-slate-400">
                  {newYearTheme ? '🎄 Активно' : 'Выключено'}
                </p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-slate-300">
              <p>• Снежинки на фоне</p>
              <p>• Праздничные цвета и эффекты</p>
              <p>• Новогодние элементы в дизайне</p>
              <p>• Поздравительные надписи</p>
            </div>
          </div>

          <Button
            onClick={handleToggleTheme}
            disabled={loading}
            className={`${
              newYearTheme 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            } min-w-[140px]`}
          >
            {loading ? (
              <Icon name="Loader2" className="animate-spin" size={20} />
            ) : (
              <>
                <Icon name={newYearTheme ? 'X' : 'Sparkles'} size={20} className="mr-2" />
                {newYearTheme ? 'Выключить' : 'Включить'}
              </>
            )}
          </Button>
        </div>

        {newYearTheme && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-500/30">
            <p className="text-sm text-slate-300 flex items-center gap-2">
              <Icon name="Info" size={16} className="text-blue-400" />
              Новогодняя тема активна для всех посетителей сайта
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};
