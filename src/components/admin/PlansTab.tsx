import { useState } from 'react';
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
  const [draggedPlanId, setDraggedPlanId] = useState<number | null>(null);
  const [dragOverPlanId, setDragOverPlanId] = useState<number | null>(null);

  const handleDragStart = (planId: number) => {
    setDraggedPlanId(planId);
  };

  const handleDragOver = (e: React.DragEvent, planId: number) => {
    e.preventDefault();
    setDragOverPlanId(planId);
  };

  const handleDragLeave = () => {
    setDragOverPlanId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetPlanId: number) => {
    e.preventDefault();
    
    if (draggedPlanId === null || draggedPlanId === targetPlanId) {
      setDraggedPlanId(null);
      setDragOverPlanId(null);
      return;
    }

    const draggedIndex = plans.findIndex(p => p.plan_id === draggedPlanId);
    const targetIndex = plans.findIndex(p => p.plan_id === targetPlanId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedPlanId(null);
      setDragOverPlanId(null);
      return;
    }

    const distance = Math.abs(draggedIndex - targetIndex);
    
    for (let i = 0; i < distance; i++) {
      if (draggedIndex < targetIndex) {
        await onMove(draggedPlanId, 'down');
      } else {
        await onMove(draggedPlanId, 'up');
      }
    }

    setDraggedPlanId(null);
    setDragOverPlanId(null);
  };

  const handleDragEnd = () => {
    setDraggedPlanId(null);
    setDragOverPlanId(null);
  };

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
              plans.filter(plan => plan && typeof plan === 'object' && plan.plan_id != null && plan.plan_id !== undefined).map((plan) => (
                <TableRow 
                  key={plan.plan_id}
                  draggable
                  onDragStart={() => handleDragStart(plan.plan_id)}
                  onDragOver={(e) => handleDragOver(e, plan.plan_id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, plan.plan_id)}
                  onDragEnd={handleDragEnd}
                  className={`cursor-move transition-colors ${
                    draggedPlanId === plan.plan_id ? 'opacity-50' : ''
                  } ${
                    dragOverPlanId === plan.plan_id && draggedPlanId !== plan.plan_id 
                      ? 'border-t-2 border-primary' 
                      : ''
                  }`}
                >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Icon name="GripVertical" className="w-4 h-4 text-muted-foreground" />
                    {plan.plan_id}
                  </div>
                </TableCell>
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