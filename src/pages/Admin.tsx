import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";

interface Plan {
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

interface Client {
  username: string;
  email: string;
  last_payment: string;
  total_paid: number;
  payment_count: number;
}

const Admin = () => {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'plans' | 'clients'>('plans');
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const { toast } = useToast();

  const API_URL = 'https://functions.poehali.dev/3a00e893-a412-40ec-9669-5978a649e9c6';

  useEffect(() => {
    const savedPassword = localStorage.getItem('admin_password');
    if (savedPassword) {
      setPassword(savedPassword);
      handleLogin(savedPassword);
    }
  }, []);

  const handleLogin = async (pwd?: string) => {
    const passToUse = pwd || password;
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}?action=plans`, {
        headers: {
          'X-Admin-Password': passToUse
        }
      });
      
      if (response.status === 401) {
        toast({
          title: '❌ Неверный пароль',
          variant: 'destructive'
        });
        setIsAuthorized(false);
        localStorage.removeItem('admin_password');
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
        setIsAuthorized(true);
        localStorage.setItem('admin_password', passToUse);
        
        toast({
          title: '✅ Вход выполнен',
          description: 'Добро пожаловать в админ-панель'
        });
      }
    } catch (error) {
      toast({
        title: '❌ Ошибка подключения',
        description: String(error),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=clients`, {
        headers: {
          'X-Admin-Password': password
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (error) {
      toast({
        title: '❌ Ошибка загрузки клиентов',
        description: String(error),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!editingPlan) return;
    
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password
        },
        body: JSON.stringify(editingPlan)
      });
      
      if (response.ok) {
        toast({
          title: '✅ Сохранено',
          description: 'Тариф успешно обновлён'
        });
        setEditingPlan(null);
        handleLogin(password);
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
          'X-Admin-Password': password
        }
      });
      
      if (response.ok) {
        toast({
          title: '✅ Удалено',
          description: 'Тариф удалён'
        });
        handleLogin(password);
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

  const handleDeleteClient = async (username: string) => {
    if (!confirm(`Удалить клиента ${username} и все его платежи?`)) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?username=${encodeURIComponent(username)}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Password': password
        }
      });
      
      if (response.ok) {
        toast({
          title: '✅ Удалено',
          description: 'Клиент удалён'
        });
        loadClients();
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

  const handleLogout = () => {
    setIsAuthorized(false);
    setPassword('');
    localStorage.removeItem('admin_password');
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Lock" className="w-6 h-6" />
              Админ-панель Speed VPN
            </CardTitle>
            <CardDescription>Введите пароль для доступа</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Пароль</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Введите пароль"
              />
            </div>
            <Button 
              className="w-full" 
              onClick={() => handleLogin()}
              disabled={loading || !password}
            >
              {loading ? 'Проверка...' : 'Войти'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Админ-панель Speed VPN</h1>
            <p className="text-muted-foreground">Управление тарифами и клиентами</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <Icon name="LogOut" className="w-4 h-4 mr-2" />
            Выход
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'plans' ? 'default' : 'outline'}
            onClick={() => setActiveTab('plans')}
          >
            <Icon name="Package" className="w-4 h-4 mr-2" />
            Тарифы ({plans.length})
          </Button>
          <Button
            variant={activeTab === 'clients' ? 'default' : 'outline'}
            onClick={() => {
              setActiveTab('clients');
              loadClients();
            }}
          >
            <Icon name="Users" className="w-4 h-4 mr-2" />
            Клиенты ({clients.length})
          </Button>
        </div>

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Управление тарифами</CardTitle>
                  <CardDescription>Редактируйте цены и параметры тарифов</CardDescription>
                </div>
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
                  <Icon name="Plus" className="w-4 h-4 mr-2" />
                  Добавить тариф
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Название</TableHead>
                    <TableHead>Цена</TableHead>
                    <TableHead>Дни</TableHead>
                    <TableHead>ГБ/день</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan) => (
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
                      <TableCell className="space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingPlan(plan)}
                        >
                          <Icon name="Edit" className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeletePlan(plan.plan_id)}
                        >
                          <Icon name="Trash" className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <Card>
            <CardHeader>
              <CardTitle>Список клиентов</CardTitle>
              <CardDescription>Все пользователи VPN</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Последний платёж</TableHead>
                    <TableHead>Всего оплачено</TableHead>
                    <TableHead>Платежей</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.username}>
                      <TableCell className="font-mono">{client.username}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>
                        {client.last_payment ? new Date(client.last_payment).toLocaleString('ru-RU') : '—'}
                      </TableCell>
                      <TableCell>{client.total_paid}₽</TableCell>
                      <TableCell>{client.payment_count}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteClient(client.username)}
                          disabled={loading}
                        >
                          <Icon name="Trash" className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Edit Plan Modal */}
        {editingPlan && (
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
                
                <div className="flex gap-4 pt-4">
                  <Button onClick={handleSavePlan} disabled={loading}>
                    {loading ? 'Сохранение...' : 'Сохранить'}
                  </Button>
                  <Button variant="outline" onClick={() => setEditingPlan(null)}>
                    Отмена
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;