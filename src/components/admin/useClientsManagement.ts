import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Client } from "@/components/admin/ClientsTab";

export const useClientsManagement = (API_URL: string, password: string) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

  return {
    clients,
    setClients,
    loading,
    loadClients
  };
};
