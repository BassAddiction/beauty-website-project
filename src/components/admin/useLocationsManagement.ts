import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Location } from "@/components/admin/LocationsTab";

export const useLocationsManagement = (
  LOCATIONS_API: string,
  SYNC_LOCATIONS_API: string,
  password: string
) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

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

  const handleSyncLocations = async () => {
    setSyncing(true);
    try {
      const response = await fetch(SYNC_LOCATIONS_API, {
        method: 'POST',
        headers: {
          'X-Admin-Password': password
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: '✅ Синхронизация завершена',
          description: `Обновлено локаций: ${data.updated_count || 0}`
        });
        loadLocations();
      }
    } catch (error) {
      toast({
        title: '❌ Ошибка синхронизации',
        description: String(error),
        variant: 'destructive'
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleMoveLocation = async (locationId: number, direction: 'up' | 'down') => {
    if (!locations || locations.length === 0) return;
    
    const currentIndex = locations.findIndex(l => l?.location_id === locationId);
    if (currentIndex === -1) return;
    
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= locations.length) return;
    
    const currentLocation = locations[currentIndex];
    const targetLocation = locations[targetIndex];
    
    if (!currentLocation || !targetLocation) return;
    
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

  return {
    locations,
    setLocations,
    editingLocation,
    setEditingLocation,
    loading,
    syncing,
    loadLocations,
    handleSaveLocation,
    handleDeleteLocation,
    handleSyncLocations,
    handleMoveLocation
  };
};