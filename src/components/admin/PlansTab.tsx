import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

export interface Plan {
  plan_id: number;
  name: string;
  price: number;
  days: number;
  traffic_gb: number;
  is_active: boolean;
  is_custom: boolean;
  sort_order: number;
  features: string[];
  show_on: string[];
  squad_uuids?: string[];
}

interface PlansTabProps {
  plans: Plan[];
  loading?: boolean;
  onEdit: (plan: Plan) => void;
  onDelete: (planId: number) => void;
  onMove: (planId: number, direction: 'up' | 'down') => void;
}

export const PlansTab = ({ plans, loading, onEdit, onDelete, onMove }: PlansTabProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Управление тарифами</CardTitle>
            <CardDescription>Редактируйте цены и параметры тарифов</CardDescription>
          </div>
          <Button onClick={() => onEdit({
            plan_id: 0,
            name: '',
            price: 0,
            days: 30,
            traffic_gb: 30,
            is_active: true,
            is_custom: false,
            sort_order: plans.length + 1,
            features: [],
            show_on: ['register', 'pricing'],
            squad_uuids: []
          })}>
            <Icon name="Plus" className="w-4 h-4 mr-2" />
            Добавить тариф
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Цена</TableHead>
              <TableHead>Дни</TableHead>
              <TableHead>ГБ/день</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Порядок</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <Icon name="Loader2" className="w-8 h-8 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : plans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Тарифы не найдены
                </TableCell>
              </TableRow>
            ) : (
              plans.filter(plan => plan && plan.plan_id).map((plan) => (
                <TableRow key={plan.plan_id}>
                <TableCell>{plan.plan_id}</TableCell>
                <TableCell>{plan.name}</TableCell>
                <TableCell>{plan.price}₽</TableCell>
                <TableCell>{plan.days}</TableCell>
                <TableCell>{plan.traffic_gb}</TableCell>
                <TableCell>
                  <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                    {plan.is_active ? 'Активен' : 'Неактивен'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onMove(plan.plan_id, 'up')}
                      disabled={plans.indexOf(plan) === 0}
                    >
                      <Icon name="ChevronUp" className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onMove(plan.plan_id, 'down')}
                      disabled={plans.indexOf(plan) === plans.length - 1}
                    >
                      <Icon name="ChevronDown" className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => onEdit(plan)}>
                      <Icon name="Pencil" className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(plan.plan_id)}>
                      <Icon name="Trash2" className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};