import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface AdminTabsProps {
  activeTab: 'plans' | 'clients' | 'users';
  setActiveTab: (tab: 'plans' | 'clients' | 'users') => void;
  plansCount: number;
  clientsCount: number;
  loadClients: () => void;
}

export const AdminTabs = ({ activeTab, setActiveTab, plansCount, clientsCount, loadClients }: AdminTabsProps) => {
  return (
    <div className="flex gap-2 mb-6">
      <Button
        variant={activeTab === 'plans' ? 'default' : 'outline'}
        onClick={() => setActiveTab('plans')}
      >
        <Icon name="Package" className="w-4 h-4 mr-2" />
        Тарифы ({plansCount})
      </Button>
      <Button
        variant={activeTab === 'clients' ? 'default' : 'outline'}
        onClick={() => {
          setActiveTab('clients');
          loadClients();
        }}
      >
        <Icon name="Users" className="w-4 h-4 mr-2" />
        Клиенты ({clientsCount})
      </Button>
      <Button
        variant={activeTab === 'users' ? 'default' : 'outline'}
        onClick={() => setActiveTab('users')}
      >
        <Icon name="UserCog" className="w-4 h-4 mr-2" />
        Пользователи
      </Button>
    </div>
  );
};
