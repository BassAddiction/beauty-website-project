import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { CDN_ASSETS } from '@/config/api';

interface DashboardHeaderProps {
  username: string;
  onLogout: () => void;
}

export const DashboardHeader = ({ username, onLogout }: DashboardHeaderProps) => {
  return (
    <div className="space-y-6 mb-8">
      <div className="flex justify-center">
        <a href="/" className="transition-transform hover:scale-105">
          <img 
            src={CDN_ASSETS.LOGO} 
            alt="Speed VPN" 
            className="w-16 h-16 rounded-full object-cover border-2 border-primary"
          />
        </a>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Личный кабинет</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-muted-foreground">Ваш username:</p>
            <code className="px-2 py-1 bg-muted rounded text-sm font-mono">{username}</code>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(username);
                alert('Username скопирован!');
              }}
            >
              <Icon name="Copy" className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <Button variant="outline" onClick={onLogout}>
          <Icon name="LogOut" className="w-4 h-4 mr-2" />
          Выход
        </Button>
      </div>
    </div>
  );
};