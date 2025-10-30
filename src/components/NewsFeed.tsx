import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

interface News {
  news_id: number;
  title: string;
  content: string;
  created_at: string;
}

export const NewsFeed = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/3b70872b-40db-4e8a-81e6-228e407e152b?public=true');
        
        if (response.ok) {
          const data = await response.json();
          setNews(data.news || []);
        } else {
          setError('Не удалось загрузить новости');
        }
      } catch (err) {
        setError('Ошибка подключения');
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Icon name="Loader2" className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <Icon name="AlertCircle" size={32} className="mx-auto mb-2" />
        <p>{error}</p>
      </div>
    );
  }

  if (news.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-8">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Icon name="Newspaper" size={28} />
        Новости
      </h2>
      
      <div className="grid gap-4">
        {news.map((item) => (
          <Card key={item.news_id} className="p-6 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
            <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
            <p className="text-slate-300 whitespace-pre-wrap mb-3">{item.content}</p>
            <p className="text-xs text-slate-500">
              {new Date(item.created_at).toLocaleString('ru-RU')}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};
