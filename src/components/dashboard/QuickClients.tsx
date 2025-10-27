import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

interface QuickClientsProps {
  subUrl: string;
}

const quickClients = [
  {
    name: 'Happ',
    scheme: 'happ',
    icon: 'Smartphone'
  },
  {
    name: 'V2rayTUN',
    scheme: 'v2raytun',
    icon: 'Smartphone'
  }
];

export const QuickClients = ({ subUrl }: QuickClientsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {quickClients.map((client) => (
        <Card 
          key={client.name}
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => window.location.href = `${client.scheme}://install-config?url=${encodeURIComponent(subUrl)}`}
        >
          <CardContent className="flex items-center gap-3 p-4">
            <Icon name={client.icon as any} className="w-6 h-6 text-primary" />
            <div className="flex-1">
              <p className="font-semibold">{client.name}</p>
              <p className="text-xs text-muted-foreground">Добавить подписку</p>
            </div>
            <Icon name="ChevronRight" className="w-5 h-5 text-muted-foreground" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};