import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

export interface News {
  news_id?: number;
  title: string;
  content: string;
  is_active: boolean;
  is_pinned?: boolean;
  created_at?: string;
  updated_at?: string;
  sort_order: number;
}

interface NewsTabProps {
  news: News[];
  loading: boolean;
  onEdit: (news: News) => void;
  onDelete: (newsId: number) => void;
  onMove: (newsId: number, direction: 'up' | 'down') => void;
  onTogglePin: (newsId: number, isPinned: boolean) => void;
  onCreate: () => void;
}

export const NewsTab = ({ news, loading, onEdit, onDelete, onMove, onTogglePin, onCreate }: NewsTabProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader2" className="animate-spin text-white" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Новости</h2>
        <Button onClick={onCreate} className="bg-green-600 hover:bg-green-700">
          <Icon name="Plus" size={20} className="mr-2" />
          Создать новость
        </Button>
      </div>

      <div className="grid gap-4">
        {news.map((item, index) => (
          <Card key={item.news_id} className="p-6 bg-slate-800 border-slate-700">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                  {item.is_pinned && (
                    <span className="px-2 py-1 text-xs bg-yellow-600 text-white rounded flex items-center gap-1">
                      <Icon name="Pin" size={12} />
                      Закреплена
                    </span>
                  )}
                  {item.is_active ? (
                    <span className="px-2 py-1 text-xs bg-green-600 text-white rounded">
                      Активна
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-gray-600 text-white rounded">
                      Скрыта
                    </span>
                  )}
                </div>
                <p className="text-slate-300 text-sm mb-2 whitespace-pre-wrap">{item.content}</p>
                {item.created_at && (
                  <p className="text-xs text-slate-500">
                    Создано: {new Date(item.created_at).toLocaleString('ru-RU')}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onTogglePin(item.news_id!, !item.is_pinned)}
                  className={`${item.is_pinned ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 hover:bg-gray-700'} border-0`}
                  title={item.is_pinned ? 'Открепить' : 'Закрепить'}
                >
                  <Icon name={item.is_pinned ? "PinOff" : "Pin"} size={16} />
                </Button>

                <div className="flex flex-col gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onMove(item.news_id!, 'up')}
                    disabled={index === 0}
                    className="h-8 w-8 p-0"
                  >
                    <Icon name="ChevronUp" size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onMove(item.news_id!, 'down')}
                    disabled={index === news.length - 1}
                    className="h-8 w-8 p-0"
                  >
                    <Icon name="ChevronDown" size={16} />
                  </Button>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(item)}
                  className="bg-blue-600 hover:bg-blue-700 border-0"
                >
                  <Icon name="Pencil" size={16} />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(item.news_id!)}
                  className="bg-red-600 hover:bg-red-700 border-0"
                >
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {news.length === 0 && (
          <Card className="p-12 bg-slate-800 border-slate-700">
            <p className="text-center text-slate-400">
              Новостей пока нет. Создайте первую новость!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};