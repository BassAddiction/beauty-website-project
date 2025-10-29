import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import UsersManagement from "@/components/UsersManagement";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { PlansTab, Plan } from "@/components/admin/PlansTab";
import { ClientsTab, Client } from "@/components/admin/ClientsTab";
import { PlanEditModal } from "@/components/admin/PlanEditModal";
import { LocationsTab, Location } from "@/components/admin/LocationsTab";
import { LocationEditModal } from "@/components/admin/LocationEditModal";

const Admin = () => {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'plans' | 'clients' | 'users' | 'locations'>('plans');
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const { toast } = useToast();

  const API_URL = 'https://functions.poehali.dev/c56efe3d-0219-4eab-a894-5d98f0549ef0';
  const LOCATIONS_API = 'https://functions.poehali.dev/3271c5a0-f0f4-42e8-b230-c35b772c0024';

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

  const handleMovePlan = async (planId: number, direction: 'up' | 'down') => {
    const currentIndex = plans.findIndex(p => p.plan_id === planId);
    if (currentIndex === -1) return;
    
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= plans.length) return;
    
    const currentPlan = plans[currentIndex];
    const targetPlan = plans[targetIndex];
    
    setLoading(true);
    try {
      const newCurrentOrder = targetPlan.sort_order;
      const newTargetOrder = currentPlan.sort_order;
      
      await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password
        },
        body: JSON.stringify({
          ...currentPlan,
          sort_order: newCurrentOrder
        })
      });
      
      await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password
        },
        body: JSON.stringify({
          ...targetPlan,
          sort_order: newTargetOrder
        })
      });
      
      toast({
        title: '✅ Порядок изменён',
        description: 'Тарифы переупорядочены'
      });
      
      handleLogin(password);
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

  const loadLocations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${LOCATIONS_API}?admin=true`, {
        headers: {
          'X-Admin-Password': password
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLocations(data.locations || []);
      }
    } catch (error) {
      toast({
        title: '❌ Ошибка загрузки локаций',
        description: String(error),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLocation = async () => {
    if (!editingLocation) return;
    
    setLoading(true);
    try {
      const response = await fetch(LOCATIONS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password
        },
        body: JSON.stringify(editingLocation)
      });
      
      if (response.ok) {
        toast({
          title: '✅ Сохранено',
          description: 'Локация успешно обновлена'
        });
        setEditingLocation(null);
        loadLocations();
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

  const handleDeleteLocation = async (locationId: number) => {
    if (!confirm('Удалить локацию?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${LOCATIONS_API}?location_id=${locationId}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Password': password
        }
      });
      
      if (response.ok) {
        toast({
          title: '✅ Удалено',
          description: 'Локация удалена'
        });
        loadLocations();
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

  const handleMoveLocation = async (locationId: number, direction: 'up' | 'down') => {
    const currentIndex = locations.findIndex(l => l.location_id === locationId);
    if (currentIndex === -1) return;
    
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= locations.length) return;
    
    const currentLocation = locations[currentIndex];
    const targetLocation = locations[targetIndex];
    
    setLoading(true);
    try {
      const newCurrentOrder = targetLocation.sort_order;
      const newTargetOrder = currentLocation.sort_order;
      
      await fetch(LOCATIONS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password
        },
        body: JSON.stringify({
          ...currentLocation,
          sort_order: newCurrentOrder
        })
      });
      
      await fetch(LOCATIONS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password
        },
        body: JSON.stringify({
          ...targetLocation,
          sort_order: newTargetOrder
        })
      });
      
      toast({
        title: '✅ Порядок изменён',
        description: 'Локации переупорядочены'
      });
      
      loadLocations();
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
          locationsCount={locations.length}
          loadClients={loadClients}
          loadLocations={loadLocations}
        />

        {activeTab === 'plans' && (
          <PlansTab
            plans={plans}
            setEditingPlan={setEditingPlan}
            handleDeletePlan={handleDeletePlan}
            handleMovePlan={handleMovePlan}
          />
        )}

        {activeTab === 'clients' && (
          <ClientsTab clients={clients} />
        )}

        {activeTab === 'users' && (
          <UsersManagement adminPassword={password} />
        )}

        {activeTab === 'locations' && (
          <LocationsTab
            locations={locations}
            setEditingLocation={setEditingLocation}
            handleDeleteLocation={handleDeleteLocation}
            handleMoveLocation={handleMoveLocation}
          />
        )}

        {editingPlan && (
          <PlanEditModal
            editingPlan={editingPlan}
            setEditingPlan={setEditingPlan}
            handleSavePlan={handleSavePlan}
            loading={loading}
          />
        )}

        {editingLocation && (
          <LocationEditModal
            editingLocation={editingLocation}
            setEditingLocation={setEditingLocation}
            handleSaveLocation={handleSaveLocation}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default Admin;