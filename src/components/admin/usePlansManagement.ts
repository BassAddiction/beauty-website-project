import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Plan } from "@/components/admin/PlansTab";

export const usePlansManagement = (API_URL: string, password: string, reloadPlans: () => Promise<void>) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
        await reloadPlans();
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
        await reloadPlans();
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
      
      await reloadPlans();
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

  return {
    plans,
    setPlans,
    editingPlan,
    setEditingPlan,
    loading,
    handleSavePlan,
    handleDeletePlan,
    handleMovePlan
  };
};
