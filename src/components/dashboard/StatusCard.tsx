import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

interface StatusCardProps {
  status: string;
  expire: number;
  usedTraffic: number;
  dataLimit: number;
  formatDate: (timestamp: number) => string;
  formatBytes: (bytes: number) => string;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

export const StatusCard = ({
  status,
  expire,
  usedTraffic,
  dataLimit,
  formatDate,
  formatBytes,
  getStatusColor,
  getStatusText
}: StatusCardProps) => {
  const usagePercent = dataLimit > 0 ? (usedTraffic / dataLimit) * 100 : 0;

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Статус подписки</CardTitle>
            <CardDescription>Информация о вашем тарифе</CardDescription>
          </div>
          <Badge className={getStatusColor(status)}>
            {getStatusText(status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="Calendar" className="w-4 h-4" />
              <span>Действует до</span>
            </div>
            <p className="text-2xl font-bold">{formatDate(expire)}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="HardDrive" className="w-4 h-4" />
              <span>Использовано</span>
            </div>
            <p className="text-2xl font-bold">
              {formatBytes(usedTraffic)} / {formatBytes(dataLimit)}
            </p>
            <p className="text-xs text-muted-foreground">Лимит на сутки: 30 GB</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Использование трафика</span>
            <span>{usagePercent.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                usagePercent > 90 
                  ? 'bg-red-500' 
                  : usagePercent > 70 
                    ? 'bg-yellow-500' 
                    : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};