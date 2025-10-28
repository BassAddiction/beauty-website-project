import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface AdminHeaderProps {
  handleLogout: () => void;
}

export const AdminHeader = ({ handleLogout }: AdminHeaderProps) => {
  return (
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
  );
};
