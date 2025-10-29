import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Icon from "@/components/ui/icon";
import { Location } from "./LocationsTab";

interface LocationEditModalProps {
  editingLocation: Location;
  setEditingLocation: (location: Location | null) => void;
  handleSaveLocation: () => void;
  loading: boolean;
}

export const LocationEditModal = ({ editingLocation, setEditingLocation, handleSaveLocation, loading }: LocationEditModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {editingLocation.location_id ? 'Редактировать локацию' : 'Новая локация'}
          </h2>
          <Button variant="ghost" size="icon" onClick={() => setEditingLocation(null)}>
            <Icon name="X" className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Название страны</Label>
              <Input
                value={editingLocation.name}
                onChange={(e) => setEditingLocation({ ...editingLocation, name: e.target.value })}
                placeholder="Россия"
              />
            </div>
            <div>
              <Label>Код страны</Label>
              <Input
                value={editingLocation.country_code}
                onChange={(e) => setEditingLocation({ ...editingLocation, country_code: e.target.value.toUpperCase() })}
                placeholder="RU"
                maxLength={3}
              />
            </div>
          </div>

          <div>
            <Label>Флаг (эмодзи)</Label>
            <Input
              value={editingLocation.flag}
              onChange={(e) => setEditingLocation({ ...editingLocation, flag: e.target.value })}
              placeholder="🇷🇺"
              maxLength={10}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Цена за день (₽)</Label>
              <Input
                type="number"
                value={editingLocation.price_per_day}
                onChange={(e) => setEditingLocation({ ...editingLocation, price_per_day: parseFloat(e.target.value) || 0 })}
                placeholder="5"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label>ГБ трафика в день</Label>
              <Input
                type="number"
                value={editingLocation.traffic_gb_per_day}
                onChange={(e) => setEditingLocation({ ...editingLocation, traffic_gb_per_day: parseInt(e.target.value) || 1 })}
                placeholder="1"
                min="1"
              />
            </div>
          </div>

          <div>
            <Label>Порядок сортировки</Label>
            <Input
              type="number"
              value={editingLocation.sort_order}
              onChange={(e) => setEditingLocation({ ...editingLocation, sort_order: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={editingLocation.is_active}
              onCheckedChange={(checked) => setEditingLocation({ ...editingLocation, is_active: checked })}
            />
            <Label>Локация активна</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSaveLocation} disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Icon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Icon name="Save" className="w-4 h-4 mr-2" />
                  Сохранить
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setEditingLocation(null)} disabled={loading}>
              Отмена
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
