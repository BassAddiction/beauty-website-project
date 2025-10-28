import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Icon from "@/components/ui/icon";

interface SubscriptionPlan {
  plan_id: number;
  name: string;
  price: number;
  days: number;
  traffic_gb: number;
  is_active: boolean;
  is_custom: boolean;
  sort_order: number;
  features: string[];
}

interface RegisterPlansManagementProps {
  adminPassword: string;
}

const RegisterPlansManagement = ({ adminPassword }: RegisterPlansManagementProps) => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  const API_URL = 'https://functions.poehali.dev/c56efe3d-0219-4eab-a894-5d98f0549ef0';

  const loadPlans = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=plans`, {
        headers: {
          'X-Admin-Password': adminPassword
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }

      const data = await response.json();
      setPlans(data.plans || []);
    } catch (error) {
      console.error('Load plans error:', error);
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось загрузить тарифы',
        variant: 'destructive'
      });
    }
    setLoading(false);
  };

  const handleSavePlan = async () => {
    if (!editingPlan) return;

    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword
        },
        body: JSON.stringify(editingPlan)
      });

      if (response.ok) {
        toast({
          title: '✅ Сохранено',
          description: 'Тариф успешно обновлён'
        });
        setEditingPlan(null);
        loadPlans();
      }
    } catch (error) {
      toast({
        title: '❌ Ошибка сохранения',
        description: String(error),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (planId: number) => {
    if (!confirm('Удалить тариф?')) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?plan_id=${planId}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Password': adminPassword
        }
      });

      if (response.ok) {
        toast({
          title: '✅ Удалено',
          description: 'Тариф удалён'
        });
        loadPlans();
      }
    } catch (error) {
      toast({
        title: '❌ Ошибка удаления',
        description: String(error),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminPassword) {
      loadPlans();
    }
  }, [adminPassword]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Тарифы для страницы регистрации</h2>
          <p className="text-muted-foreground">Управление тарифными планами для новых пользователей</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadPlans} disabled={loading} variant="outline">
            <Icon name="RefreshCw" size={16} className="mr-2" />
            Обновить
          </Button>
          <Button onClick={() => setEditingPlan({
            plan_id: 0,
            name: '',
            price: 0,
            days: 30,
            traffic_gb: 30,
            is_active: true,
            is_custom: false,
            sort_order: plans.length + 1,
            features: []
          })}>
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить тариф
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Цена</TableHead>
                  <TableHead>Дни</TableHead>
                  <TableHead>ГБ/день</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Сортировка</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Icon name="Loader2" size={32} className="animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : plans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Тарифы не найдены
                    </TableCell>
                  </TableRow>
                ) : (
                  plans.map((plan) => (
                    <TableRow key={plan.plan_id}>
                      <TableCell>{plan.plan_id}</TableCell>
                      <TableCell className="font-medium">{plan.name}</TableCell>
                      <TableCell>{plan.price}₽</TableCell>
                      <TableCell>{plan.days}</TableCell>
                      <TableCell>{plan.traffic_gb}</TableCell>
                      <TableCell>
                        <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                          {plan.is_active ? 'Активен' : 'Неактивен'}
                        </Badge>
                      </TableCell>
                      <TableCell>{plan.sort_order}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingPlan(plan)}
                        >
                          <Icon name="Edit" size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeletePlan(plan.plan_id)}
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {editingPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingPlan.plan_id === 0 ? 'Новый тариф' : 'Редактировать тариф'}
              </CardTitle>
              <CardDescription>Заполните информацию о тарифе</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Название</Label>
                  <Input
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                    placeholder="Например: Starter"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Цена (₽)</Label>
                  <Input
                    type="number"
                    value={editingPlan.price}
                    onChange={(e) => setEditingPlan({ ...editingPlan, price: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Дней доступа</Label>
                  <Input
                    type="number"
                    value={editingPlan.days}
                    onChange={(e) => setEditingPlan({ ...editingPlan, days: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>ГБ трафика в день</Label>
                  <Input
                    type="number"
                    value={editingPlan.traffic_gb}
                    onChange={(e) => setEditingPlan({ ...editingPlan, traffic_gb: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Порядок сортировки</Label>
                  <Input
                    type="number"
                    value={editingPlan.sort_order}
                    onChange={(e) => setEditingPlan({ ...editingPlan, sort_order: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Статус</Label>
                  <div className="flex items-center gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingPlan.is_active}
                        onChange={(e) => setEditingPlan({ ...editingPlan, is_active: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span>Активен</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Особенности тарифа (по одной на строку)</Label>
                <textarea
                  className="w-full min-h-[100px] p-2 border rounded-md"
                  value={editingPlan.features.join('\n')}
                  onChange={(e) => setEditingPlan({ 
                    ...editingPlan, 
                    features: e.target.value.split('\n').filter(f => f.trim()) 
                  })}
                  placeholder="Высокая скорость&#10;Безлимитные устройства&#10;Приоритетная поддержка"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditingPlan(null)}>
                  Отмена
                </Button>
                <Button onClick={handleSavePlan} disabled={loading}>
                  {loading ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RegisterPlansManagement;
