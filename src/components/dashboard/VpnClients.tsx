import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

const vpnClients = [
  {
    name: 'V2RayN',
    platform: 'Windows',
    icon: 'Monitor',
    url: 'https://github.com/2dust/v2rayN/releases'
  },
  {
    name: 'Shadowrocket',
    platform: 'iOS',
    icon: 'Apple',
    url: 'https://apps.apple.com/app/shadowrocket/id932747118'
  },
  {
    name: 'V2RayNG',
    platform: 'Android',
    icon: 'Smartphone',
    url: 'https://github.com/2dust/v2rayNG/releases'
  },
  {
    name: 'ClashX',
    platform: 'macOS',
    icon: 'Apple',
    url: 'https://github.com/yichengchen/clashX/releases'
  }
];

export const VpnClients = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>VPN-клиенты</CardTitle>
        <CardDescription>Скачайте приложение для вашей платформы</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vpnClients.map((client) => (
            <a
              key={client.name}
              href={client.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <Icon name={client.icon as any} className="w-8 h-8 text-primary" />
              <div className="flex-1">
                <h3 className="font-semibold">{client.name}</h3>
                <p className="text-sm text-muted-foreground">{client.platform}</p>
              </div>
              <Icon name="ExternalLink" className="w-5 h-5 text-muted-foreground" />
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};