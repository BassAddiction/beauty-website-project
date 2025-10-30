import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

export interface Location {
  location_id: number;
  name: string;
  country_code: string;
  flag: string;
  price_per_day: number;
  traffic_gb_per_day: number;
  is_active: boolean;
  sort_order: number;
}

interface LocationsTabProps {
  locations: Location[];
  loading?: boolean;
  syncing: boolean;
  onEdit: (location: Location) => void;
  onDelete: (locationId: number) => void;
  onSync: () => void;
  onMove: (locationId: number, direction: 'up' | 'down') => void;
}

export const LocationsTab = ({ locations, loading, syncing, onEdit, onDelete, onSync, onMove }: LocationsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Управление локациями</CardTitle>
            <CardDescription>Редактируйте страны и их параметры для конструктора</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={onSync}
              disabled={syncing}
            >
              {syncing ? (
                <>
                  <Icon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                  Синхронизация...
                </>
              ) : (
                <>
                  <Icon name="RefreshCw" className="w-4 h-4 mr-2" />
                  Синхронизировать с Remnawave
                </>
              )}
            </Button>
            <Button onClick={() => onEdit({
              location_id: 0,
              name: '',
              country_code: '',
              flag: '',
              price_per_day: 0,
              traffic_gb_per_day: 1,
              is_active: true,
              sort_order: locations.length + 1
            })}>
              <Icon name="Plus" className="w-4 h-4 mr-2" />
              Добавить локацию
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Флаг</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Код</TableHead>
              <TableHead>Цена/день</TableHead>
              <TableHead>ГБ/день</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Порядок</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.map((location) => (
              <TableRow key={location.location_id}>
                <TableCell>{location.location_id}</TableCell>
                <TableCell className="text-2xl">{location.flag}</TableCell>
                <TableCell>{location.name}</TableCell>
                <TableCell>{location.country_code}</TableCell>
                <TableCell>{location.price_per_day}₽</TableCell>
                <TableCell>{location.traffic_gb_per_day}</TableCell>
                <TableCell>
                  <Badge variant={location.is_active ? 'default' : 'secondary'}>
                    {location.is_active ? 'Активна' : 'Неактивна'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onMove(location.location_id, 'up')}
                      disabled={locations.indexOf(location) === 0}
                    >
                      <Icon name="ChevronUp" className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onMove(location.location_id, 'down')}
                      disabled={locations.indexOf(location) === locations.length - 1}
                    >
                      <Icon name="ChevronDown" className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => onEdit(location)}>
                      <Icon name="Pencil" className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(location.location_id)}>
                      <Icon name="Trash2" className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};