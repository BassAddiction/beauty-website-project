import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface AdminTabsProps {
  activeTab: 'plans' | 'clients' | 'users' | 'locations' | 'settings' | 'receipts' | 'news';
  setActiveTab: (tab: 'plans' | 'clients' | 'users' | 'locations' | 'settings' | 'receipts' | 'news') => void;
  plansCount: number;
  clientsCount: number;
  locationsCount: number;
  newsCount: number;
  loadClients: () => void;
  loadLocations: () => void;
  loadNews: () => void;
}

export const AdminTabs = ({ activeTab, setActiveTab, plansCount, clientsCount, locationsCount, newsCount, loadClients, loadLocations, loadNews }: AdminTabsProps) => {
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
      <Button
        variant={activeTab === 'locations' ? 'default' : 'outline'}
        onClick={() => {
          setActiveTab('locations');
          loadLocations();
        }}
      >
        <Icon name="Globe" className="w-4 h-4 mr-2" />
        Локации ({locationsCount})
      </Button>
      <Button
        variant={activeTab === 'news' ? 'default' : 'outline'}
        onClick={() => {
          setActiveTab('news');
          loadNews();
        }}
      >
        <Icon name="FileText" className="w-4 h-4 mr-2" />
        Новости ({newsCount})
      </Button>
      <Button
        variant={activeTab === 'receipts' ? 'default' : 'outline'}
        onClick={() => setActiveTab('receipts')}
      >
        <Icon name="Receipt" className="w-4 h-4 mr-2" />
        Чеки
      </Button>
      <Button
        variant={activeTab === 'settings' ? 'default' : 'outline'}
        onClick={() => setActiveTab('settings')}
      >
        <Icon name="Settings" className="w-4 h-4 mr-2" />
        Настройки
      </Button>
    </div>
  );
};