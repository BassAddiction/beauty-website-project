import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useSEO } from "@/hooks/useSEO";
import { pageSEO } from "@/utils/seo";
import Icon from '@/components/ui/icon';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import API_ENDPOINTS from '@/config/api';

interface NewsItem {
  news_id: number;
  title: string;
  content: string;
  created_at: string;
}

const News = () => {
  const seoComponent = useSEO(pageSEO.news);
  
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.NEWS}?public=true`);
      
      if (response.ok) {
        const data = await response.json();
        setNews(data.news || []);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <Icon name="Loader2" size={48} className="text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {seoComponent}
      <Helmet>
        <title>Новости Speed VPN — Обновления и новости VPN-сервиса</title>
        <meta name="description" content="Последние новости Speed VPN: обновления сервиса, новые функции, улучшения производительности и важные объявления." />
        <meta name="keywords" content="новости speed vpn, обновления vpn, новости впн сервиса, speed vpn updates" />
        <link rel="canonical" href="https://speedvpn.io/news" />
        <meta property="og:title" content="Новости Speed VPN" />
        <meta property="og:description" content="Последние новости и обновления Speed VPN" />
        <meta property="og:url" content="https://speedvpn.io/news" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "Новости Speed VPN",
            "description": "Последние новости и обновления VPN-сервиса Speed VPN",
            "url": "https://speedvpn.io/news",
            "blogPost": news.slice(0, 10).map(item => ({
              "@type": "BlogPosting",
              "headline": item.title,
              "articleBody": item.content,
              "datePublished": item.created_at,
              "author": {
                "@type": "Organization",
                "name": "Speed VPN"
              }
            }))
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="mb-8">
            <Breadcrumbs items={[{ name: 'Новости', path: '/news' }]} />
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Новости Speed VPN
            </h1>
            <p className="text-gray-400 text-lg">
              Последние обновления и важные объявления
            </p>
          </div>

          {news.length === 0 ? (
            <div className="text-center py-20 bg-gray-900 rounded-lg border border-gray-800">
              <Icon name="Newspaper" size={64} className="text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Пока нет новостей</p>
            </div>
          ) : (
            <div className="space-y-6">
              {news.map((item) => (
                <article
                  key={item.news_id}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-red-500/20 rounded-2xl p-6 hover:border-red-500/40 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center">
                      <Icon name="Bell" size={20} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{item.title}</h2>
                      <time className="text-sm text-gray-500">{formatDate(item.created_at)}</time>
                    </div>
                  </div>
                  
                  <div 
                    className="text-gray-300 leading-relaxed prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: item.content.replace(/\n/g, '<br/>') }}
                  />
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default News;