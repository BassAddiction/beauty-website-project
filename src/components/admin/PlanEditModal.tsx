import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { Plan } from "./PlansTab";

interface PlanEditModalProps {
  editingPlan: Plan;
  setEditingPlan: (plan: Plan) => void;
  handleSavePlan: () => void;
  loading: boolean;
}

export const PlanEditModal = ({ editingPlan, setEditingPlan, handleSavePlan, loading }: PlanEditModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>
            {editingPlan.plan_id ? 'Редактировать тариф' : 'Новый тариф'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Название</Label>
              <Input
                value={editingPlan.name}
                onChange={(e) => setEditingPlan({...editingPlan, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Цена (₽)</Label>
              <Input
                type="number"
                value={editingPlan.price}
                onChange={(e) => setEditingPlan({...editingPlan, price: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label>Дней</Label>
              <Input
                type="number"
                value={editingPlan.days}
                onChange={(e) => setEditingPlan({...editingPlan, days: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label>ГБ/день</Label>
              <Input
                type="number"
                value={editingPlan.traffic_gb}
                onChange={(e) => setEditingPlan({...editingPlan, traffic_gb: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Показывать на страницах</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(editingPlan.show_on || []).includes('register')}
                  onChange={(e) => {
                    const current = editingPlan.show_on || [];
                    const updated = e.target.checked
                      ? [...current.filter(p => p !== 'register'), 'register']
                      : current.filter(p => p !== 'register');
                    setEditingPlan({...editingPlan, show_on: updated});
                  }}
                  className="w-4 h-4"
                />
                <span>Register (регистрация)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(editingPlan.show_on || []).includes('pricing')}
                  onChange={(e) => {
                    const current = editingPlan.show_on || [];
                    const updated = e.target.checked
                      ? [...current.filter(p => p !== 'pricing'), 'pricing']
                      : current.filter(p => p !== 'pricing');
                    setEditingPlan({...editingPlan, show_on: updated});
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
              {(editingPlan.features || []).map((feature, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => {
                      const newFeatures = [...(editingPlan.features || [])];
                      newFeatures[idx] = e.target.value;
                      setEditingPlan({...editingPlan, features: newFeatures});
                    }}
                    placeholder="Например: Безлимитный трафик"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      const newFeatures = editingPlan.features.filter((_, i) => i !== idx);
                      setEditingPlan({...editingPlan, features: newFeatures});
                    }}
                  >
                    <Icon name="Trash" className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingPlan({
                    ...editingPlan,
                    features: [...(editingPlan.features || []), '']
                  });
                }}
              >
                <Icon name="Plus" className="w-4 h-4 mr-2" />
                Добавить возможность
              </Button>
            </div>
          </div>
          
          <div className="flex gap-4 pt-4">
            <Button onClick={handleSavePlan} disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button variant="outline" onClick={() => setEditingPlan(null as any)}>
              Отмена
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
