import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface ConnectionCardProps {
  subUrl: string;
}

export const ConnectionCard = ({ subUrl }: ConnectionCardProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Настройка подключения</CardTitle>
        <CardDescription>Скопируйте ссылку для подключения в VPN-клиент</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={subUrl}
            className="flex-1 px-4 py-2 rounded-md border bg-secondary text-sm font-mono"
          />
          <Button
            onClick={() => {
              navigator.clipboard.writeText(subUrl);
            }}
          >
            <Icon name="Copy" className="w-4 h-4 mr-2" />
            Копировать
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={() => window.location.href = `happ://install-config?url=${encodeURIComponent(subUrl)}`}
            variant="outline"
            className="w-full"
          >
            <Icon name="Download" className="w-4 h-4 mr-2" />
            Hiddify
          </Button>
          <Button 
            onClick={() => window.location.href = `v2raytun://install-config?url=${encodeURIComponent(subUrl)}`}
            variant="outline"
            className="w-full"
          >
            <Icon name="Download" className="w-4 h-4 mr-2" />
            V2rayTUN
          </Button>
        </div>
        
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <Icon name="Info" className="w-4 h-4 mt-0.5" />
          <p>Вставьте эту ссылку в настройки вашего VPN-клиента для подключения</p>
        </div>
      </CardContent>
    </Card>
  );
};