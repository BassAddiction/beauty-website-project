import { useEffect, useState, useRef } from 'react';
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import API_ENDPOINTS from '@/config/api';
import { Link } from 'react-router-dom';

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
  const [showOlder, setShowOlder] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.NEWS}?public=true`);
        
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

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const itemWidth = container.offsetWidth;
    const index = Math.round(scrollLeft / itemWidth);
    setCurrentIndex(index);
  };

  const scrollToIndex = (index: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const itemWidth = container.offsetWidth;
    container.scrollTo({
      left: index * itemWidth,
      behavior: 'smooth'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Icon name="Loader2" className="animate-spin text-primary" size={32} />
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

  const latestNews = news[0];
  const olderNews = news.slice(1);

  return (
    <div className="space-y-6 mb-12">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <Icon name="Newspaper" size={32} className="text-primary" />
          Новости
        </h2>
        <Link 
          to="/news" 
          className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2 text-sm"
        >
          Все новости
          <Icon name="ArrowRight" size={16} />
        </Link>
      </div>

      <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 hover:border-primary/50 transition-all">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Icon name="Sparkles" size={20} className="text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-2">{latestNews.title}</h3>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{latestNews.content}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {new Date(latestNews.created_at).toLocaleString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </Card>

      {olderNews.length > 0 && (
        <div className="space-y-4">
          <button
            onClick={() => setShowOlder(!showOlder)}
            className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-sm group"
          >
            <Icon 
              name={showOlder ? "ChevronUp" : "ChevronDown"} 
              size={20} 
              className="group-hover:text-primary transition-colors"
            />
            <span>{showOlder ? 'Скрыть' : 'Показать'} предыдущие новости ({olderNews.length})</span>
          </button>

          {showOlder && (
            <div className="relative">
              <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {olderNews.map((item) => (
                  <Card 
                    key={item.news_id} 
                    className="min-w-full md:min-w-[400px] p-5 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/50 snap-start"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon name="Bell" size={16} className="text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-white flex-1">{item.title}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm whitespace-pre-wrap leading-relaxed mb-3">
                      {item.content}
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      {new Date(item.created_at).toLocaleString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </Card>
                ))}
              </div>

              {olderNews.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {olderNews.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => scrollToIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        currentIndex === index 
                          ? 'bg-primary w-8' 
                          : 'bg-gray-600 hover:bg-gray-500'
                      }`}
                      aria-label={`Перейти к новости ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};