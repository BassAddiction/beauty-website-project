import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { News } from "./NewsTab";

interface NewsEditModalProps {
  news: News;
  onSave: () => void;
  onClose: () => void;
  onChange: (news: News) => void;
}

export const NewsEditModal = ({ news, onSave, onClose, onChange }: NewsEditModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-slate-800 border-slate-700 p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">
          {news.news_id ? 'Редактировать новость' : 'Создать новость'}
        </h2>

        <div className="space-y-4">
          <div>
            <Label className="text-white mb-2">Заголовок</Label>
            <Input
              value={news.title}
              onChange={(e) => onChange({ ...news, title: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Введите заголовок новости"
            />
          </div>

          <div>
            <Label className="text-white mb-2">Текст новости</Label>
            <Textarea
              value={news.content}
              onChange={(e) => onChange({ ...news, content: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white min-h-[200px]"
              placeholder="Введите текст новости..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={news.is_active}
              onChange={(e) => onChange({ ...news, is_active: e.target.checked })}
              className="w-4 h-4"
            />
            <Label htmlFor="is_active" className="text-white cursor-pointer">
              Показывать на сайте
            </Label>
          </div>

          <div>
            <Label className="text-white mb-2">Порядок сортировки</Label>
            <Input
              type="number"
              value={news.sort_order}
              onChange={(e) => onChange({ ...news, sort_order: parseInt(e.target.value) || 0 })}
              className="bg-slate-700 border-slate-600 text-white"
            />
            <p className="text-xs text-slate-400 mt-1">
              Чем больше число, тем выше новость в списке
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={onSave} className="flex-1 bg-green-600 hover:bg-green-700">
            Сохранить
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">
            Отмена
          </Button>
        </div>
      </Card>
    </div>
  );
};
