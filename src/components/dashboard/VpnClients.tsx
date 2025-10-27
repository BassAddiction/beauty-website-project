import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const vpnClients = [
  {
    name: 'Happ',
    logo: 'H',
    description: 'Простой и удобный клиент с понятным интерфейсом для быстрого подключения',
    platforms: [
      { name: 'Play Market', icon: 'Smartphone', url: 'https://play.google.com/store/apps/details?id=app.happ.android' },
      { name: 'App Store', icon: 'Apple', url: 'https://apps.apple.com/us/app/happ-proxy-utility/id6504287215' },
      { name: 'Windows', icon: 'Monitor', url: 'https://github.com/happ-ai/releases' }
    ]
  },
  {
    name: 'V2RayTun',
    logo: 'V2',
    description: 'Мощный клиент с продвинутыми настройками и поддержкой всех протоколов',
    platforms: [
      { name: 'Play Market', icon: 'Smartphone', url: 'https://play.google.com/store/apps/details?id=com.v2raytun.android' },
      { name: 'App Store', icon: 'Apple', url: 'https://apps.apple.com/app/v2raytun/id6476628951' },
      { name: 'Windows', icon: 'Monitor', url: 'https://github.com/2dust/v2rayN/releases' }
    ]
  }
];

export const VpnClients = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>VPN-клиенты</CardTitle>
        <CardDescription>Мы рекомендуем использовать проверенные и надежные клиенты</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vpnClients.map((client) => (
            <div
              key={client.name}
              className="p-6 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{client.logo}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{client.name}</h3>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-6">
                {client.description}
              </p>

              <div className="space-y-2">
                {client.platforms.map((platform) => (
                  <Button
                    key={platform.name}
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <a href={platform.url} target="_blank" rel="noopener noreferrer">
                      <Icon name={platform.icon as any} className="w-4 h-4 mr-2" />
                      {platform.name}
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};