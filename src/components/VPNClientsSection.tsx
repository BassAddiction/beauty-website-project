import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface VPNClient {
  name: string;
  description: string;
  icon?: string;
  logo?: string;
  platforms: {
    playMarket?: string;
    appStore?: string;
    windows?: string;
  };
}

const VPNClientsSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  const clients: VPNClient[] = [
    {
      name: "Happ",
      description: "Простой и удобный клиент с понятным интерфейсом для быстрого подключения",
      logo: "https://cdn.poehali.dev/files/ef467f96-b43a-4159-b874-f59e2545f7d7.png",
      platforms: {
        playMarket: "https://play.google.com/store/apps/details?id=com.happproxy",
        appStore: "https://apps.apple.com/ru/app/happ-proxy-utility-plus/id6746188973?platform=iphone",
        windows: "https://github.com/hiddify/hiddify-next/releases"
      }
    },
    {
      name: "V2RayTun",
      description: "Мощный клиент с продвинутыми настройками и поддержкой всех протоколов",
      logo: "https://cdn.poehali.dev/files/063411ec-f9b3-487a-aeb1-e5717cf643c4.png",
      platforms: {
        playMarket: "https://play.google.com/store/apps/details?id=com.v2raytun.android",
        appStore: "https://apps.apple.com/app/v2box-v2ray-client/id6446814690",
        windows: "https://github.com/2dust/v2rayN/releases"
      }
    }
  ];

  return (
    <section ref={ref} className="py-20 px-4 bg-black/30" id="clients">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-black mb-4">VPN-Клиент</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Выберите подходящее приложение для вашего устройства
          </p>
        </div>

        <div className={`grid md:grid-cols-2 gap-8 max-w-4xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {clients.map((client, index) => (
            <Card key={index} className="border-2 hover:border-primary transition-all duration-300 hover:scale-105">
              <CardHeader>
                {client.logo ? (
                  <div className="w-16 h-16 mb-4">
                    <img src={client.logo} alt={client.name} className="w-full h-full rounded-2xl object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <Icon name={client.icon as any} size={32} className="text-primary" />
                  </div>
                )}
                <CardTitle className="text-2xl">{client.name}</CardTitle>
                <CardDescription className="text-base">
                  {client.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {client.platforms.playMarket && (
                    <Button variant="outline" className="w-full rounded-full" asChild>
                      <a href={client.platforms.playMarket} target="_blank" rel="noopener noreferrer">
                        <Icon name="Smartphone" size={18} className="mr-2" />
                        Play Market
                      </a>
                    </Button>
                  )}
                  {client.platforms.appStore && (
                    <Button variant="outline" className="w-full rounded-full" asChild>
                      <a href={client.platforms.appStore} target="_blank" rel="noopener noreferrer">
                        <Icon name="Apple" size={18} className="mr-2" />
                        App Store
                      </a>
                    </Button>
                  )}
                  {client.platforms.windows && (
                    <Button variant="outline" className="w-full rounded-full" asChild>
                      <a href={client.platforms.windows} target="_blank" rel="noopener noreferrer">
                        <Icon name="Monitor" size={18} className="mr-2" />
                        Windows
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VPNClientsSection;