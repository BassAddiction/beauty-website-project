import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { News } from "@/components/admin/NewsTab";

export const useNewsManagement = (NEWS_API: string, password: string) => {
  const [news, setNews] = useState<News[]>([]);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadNews = async () => {
    setLoading(true);
    try {
      const response = await fetch(NEWS_API, {
        headers: {
          'X-Admin-Password': password
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNews(data.news || []);
      }
    } catch (error) {
      toast({
        title: '❌ Ошибка загрузки новостей',
        description: String(error),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNews = async () => {
    if (!editingNews) return;
    
    setLoading(true);
    try {
      const response = await fetch(NEWS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password
        },
        body: JSON.stringify(editingNews)
      });
      
      if (response.ok) {
        toast({
          title: '✅ Сохранено',
          description: 'Новость успешно сохранена'
        });
        setEditingNews(null);
        loadNews();
      }
    } catch (error) {
      toast({
        title: '❌ Ошибка сохранения',
        description: String(error),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNews = async (newsId: number) => {
    if (!confirm('Удалить новость?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${NEWS_API}?news_id=${newsId}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Password': password
        }
      });
      
      if (response.ok) {
        toast({
          title: '✅ Удалено',
          description: 'Новость удалена'
        });
        loadNews();
      }
    } catch (error) {
      toast({
        title: '❌ Ошибка удаления',
        description: String(error),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMoveNews = async (newsId: number, direction: 'up' | 'down') => {
    const currentIndex = news.findIndex(n => n.news_id === newsId);
    if (currentIndex === -1) return;
    
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= news.length) return;
    
    const currentNews = news[currentIndex];
    const targetNews = news[targetIndex];
    
    setLoading(true);
    try {
      const newCurrentOrder = targetNews.sort_order;
      const newTargetOrder = currentNews.sort_order;
      
      await fetch(NEWS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password
        },
        body: JSON.stringify({
          ...currentNews,
          sort_order: newCurrentOrder
        })
      });
      
      await fetch(NEWS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password
        },
        body: JSON.stringify({
          ...targetNews,
          sort_order: newTargetOrder
        })
      });
      
      toast({
        title: '✅ Порядок изменён',
        description: 'Новости переупорядочены'
      });
      
      loadNews();
    } catch (error) {
      toast({
        title: '❌ Ошибка',
        description: String(error),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNews = () => {
    setEditingNews({
      title: '',
      content: '',
      is_active: true,
      sort_order: 0
    });
  };

  return {
    news,
    setNews,
    editingNews,
    setEditingNews,
    loading,
    loadNews,
    handleSaveNews,
    handleDeleteNews,
    handleMoveNews,
    handleCreateNews
  };
};
