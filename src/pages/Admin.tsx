import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import UsersManagement from "@/components/UsersManagement";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { PlansTab, Plan } from "@/components/admin/PlansTab";
import { ClientsTab, Client } from "@/components/admin/ClientsTab";
import { PlanEditModal } from "@/components/admin/PlanEditModal";

const Admin = () => {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'plans' | 'clients' | 'users'>('plans');
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const { toast } = useToast();

  const API_URL = 'https://functions.poehali.dev/c56efe3d-0219-4eab-a894-5d98f0549ef0';

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

  const handleLogout = () => {
    setIsAuthorized(false);
    setPassword('');
    localStorage.removeItem('admin_password');
  };

  if (!isAuthorized) {
    return (
      <AdminLogin
        password={password}
        setPassword={setPassword}
        handleLogin={() => handleLogin()}
        loading={loading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="container mx-auto max-w-7xl">
        <AdminHeader handleLogout={handleLogout} />

        <AdminTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          plansCount={plans.length}
          clientsCount={clients.length}
          loadClients={loadClients}
        />

        {activeTab === 'plans' && (
          <PlansTab
            plans={plans}
            setEditingPlan={setEditingPlan}
            handleDeletePlan={handleDeletePlan}
          />
        )}

        {activeTab === 'clients' && (
          <ClientsTab clients={clients} />
        )}

        {activeTab === 'users' && (
          <UsersManagement adminPassword={password} />
        )}

        {editingPlan && (
          <PlanEditModal
            editingPlan={editingPlan}
            setEditingPlan={setEditingPlan}
            handleSavePlan={handleSavePlan}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default Admin;
