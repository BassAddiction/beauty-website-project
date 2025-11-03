import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { Plan } from "./PlansTab";
import { useState, useEffect } from 'react';
import API_ENDPOINTS from '@/config/api';

interface Location {
  location_id: number;
  name: string;
  squad_uuid: string;
  flag_emoji: string;
  country_code: string;
}

interface PlanEditModalProps {
  plan: Plan;
  onChange: (plan: Plan) => void;
  onSave: () => void;
  onClose: () => void;
}

export const PlanEditModal = ({ plan, onChange, onSave, onClose }: PlanEditModalProps) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const adminPassword = localStorage.getItem('admin_password') || '';

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.LOCATIONS}?admin=true`, {
          headers: { 'X-Admin-Password': adminPassword }
        });
        console.log('Locations response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Locations data:', data);
          const filteredLocations = (data.locations || []).filter((l: Location) => l.squad_uuid);
          console.log('Filtered locations with squad_uuid:', filteredLocations);
          setLocations(filteredLocations);
        } else {
          console.error('Locations response not ok:', response.status, await response.text());
        }
      } catch (error) {
        console.error('Failed to load locations:', error);
      }
    };
    if (adminPassword) {
      loadLocations();
    }
  }, [adminPassword]);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>
            {plan.plan_id ? 'Редактировать тариф' : 'Новый тариф'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Название</Label>
              <Input
                value={plan.name}
                onChange={(e) => onChange({...plan, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Цена (₽)</Label>
              <Input
                type="number"
                value={plan.price}
                onChange={(e) => onChange({...plan, price: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label>Дней</Label>
              <Input
                type="number"
                value={plan.days}
                onChange={(e) => onChange({...plan, days: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label>ГБ/день</Label>
              <Input
                type="number"
                value={plan.traffic_gb}
                onChange={(e) => onChange({...plan, traffic_gb: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Squad (группы серверов)</Label>
            <div className="space-y-2 p-3 border rounded-lg">
              {locations.length === 0 ? (
                <p className="text-sm text-muted-foreground">Загрузка локаций...</p>
              ) : (
                locations
                  .sort((a, b) => {
                    if (a.name === 'Vless-Reality') return -1;
                    if (b.name === 'Vless-Reality') return 1;
                    return a.name.localeCompare(b.name);
                  })
                  .map(loc => (
                  <label key={loc.location_id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(plan.squad_uuids || []).includes(loc.squad_uuid)}
                      onChange={(e) => {
                        const current = plan.squad_uuids || [];
                        const updated = e.target.checked
                          ? [...current, loc.squad_uuid]
                          : current.filter(uuid => uuid !== loc.squad_uuid);
                        onChange({...plan, squad_uuids: updated});
                      }}
                      className="w-4 h-4"
                    />
                    <span>{loc.flag_emoji} {loc.name} ({loc.country_code})</span>
                    <code className="text-xs text-muted-foreground ml-auto">{loc.squad_uuid.slice(0, 8)}...</code>
                  </label>
                ))
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Если не выбрано ничего - пользователь будет создан без squad (без доступа к серверам)
            </p>
          </div>

          <div className="space-y-2">
            <Label>Показывать на страницах</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(plan.show_on || []).includes('register')}
                  onChange={(e) => {
                    const current = plan.show_on || [];
                    const updated = e.target.checked
                      ? [...current.filter(p => p !== 'register'), 'register']
                      : current.filter(p => p !== 'register');
                    onChange({...plan, show_on: updated});
                  }}
                  className="w-4 h-4"
                />
                <span>Register (регистрация)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(plan.show_on || []).includes('pricing')}
                  onChange={(e) => {
                    const current = plan.show_on || [];
                    const updated = e.target.checked
                      ? [...current.filter(p => p !== 'pricing'), 'pricing']
                      : current.filter(p => p !== 'pricing');
                    onChange({...plan, show_on: updated});
                  }}
                  className="w-4 h-4"
                />
                <span>Pricing (главная)</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Описание возможностей (по одному на строку)</Label>
            <div className="space-y-2">
              {(plan.features || []).map((feature, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => {
                      const newFeatures = [...(plan.features || [])];
                      newFeatures[idx] = e.target.value;
                      onChange({...plan, features: newFeatures});
                    }}
                    placeholder="Например: Безлимитный трафик"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      const newFeatures = plan.features.filter((_, i) => i !== idx);
                      onChange({...plan, features: newFeatures});
                    }}
                  >
                    <Icon name="Trash2" className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onChange({
                    ...plan,
                    features: [...(plan.features || []), '']
                  });
                }}
              >
                <Icon name="Plus" className="w-4 h-4 mr-2" />
                Добавить возможность
              </Button>
            </div>
          </div>
          
          <div className="flex gap-4 pt-4">
            <Button onClick={onSave}>
              Сохранить
            </Button>
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};