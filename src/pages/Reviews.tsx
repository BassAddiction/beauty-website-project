import { useState, useEffect } from "react";
import { Star, Quote, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useSEO } from "@/hooks/useSEO";
import { pageSEO } from "@/utils/seo";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import FUNC2URL from "../../backend/func2url.json";

interface Review {
  id: number;
  name: string;
  location: string;
  rating: number;
  plan: string;
  text: string;
  date: string;
}

const Reviews = () => {
  useSEO(pageSEO.reviews);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(5.0);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 12;
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    rating: 5,
    plan: '',
    text: '',
    email: ''
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch(FUNC2URL.reviews);
      const data = await response.json();
      
      setReviews(data.reviews || []);
      setTotalReviews(data.total || 0);
      setAverageRating(data.average_rating || 5.0);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить отзывы',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(FUNC2URL.reviews, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Спасибо за отзыв!',
          description: 'Ваш отзыв отправлен на модерацию и появится после проверки',
          duration: 5000
        });
        
        setFormData({
          name: '',
          location: '',
          rating: 5,
          plan: '',
          text: '',
          email: ''
        });
        setShowForm(false);
      } else {
        throw new Error(data.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить отзыв. Попробуйте позже',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Отзывы клиентов Speed VPN — Реальные отзывы о VPN-сервисе</title>
        <meta name="description" content={`${totalReviews}+ реальных отзывов о Speed VPN. Средняя оценка ${averageRating.toFixed(1)}/5. Читайте мнения пользователей о скорости, стабильности и качестве VPN-сервиса.`} />
        <meta name="keywords" content="отзывы speed vpn, отзывы vpn, vpn отзывы клиентов, speed vpn мнения, реальные отзывы vpn, отзывы о впн" />
        <link rel="canonical" href="https://speedvpn.io/reviews" />
        <meta property="og:title" content="Отзывы клиентов Speed VPN — Реальные отзывы" />
        <meta property="og:description" content={`${totalReviews}+ отзывов. Оценка ${averageRating.toFixed(1)}/5. Узнайте мнение реальных пользователей Speed VPN.`} />
        <meta property="og:url" content="https://speedvpn.io/reviews" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Speed VPN",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": averageRating.toFixed(1),
              "reviewCount": totalReviews,
              "bestRating": "5",
              "worstRating": "1"
            },
            "review": reviews.slice(0, 10).map(review => ({
              "@type": "Review",
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": review.rating,
                "bestRating": "5",
                "worstRating": "1"
              },
              "author": {
                "@type": "Person",
                "name": review.name
              },
              "reviewBody": review.text,
              "datePublished": review.date
            }))
          })}
        </script>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <button
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors"
        >
          <Icon name="ArrowLeft" size={20} />
          <span>На главную</span>
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Отзывы наших клиентов
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Более 10,000 довольных пользователей по всей России выбрали Speed VPN
          </p>
          
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-500 text-yellow-500" />
              ))}
            </div>
            <span className="text-white font-semibold text-xl">{averageRating.toFixed(1)}</span>
            <span className="text-gray-400">на основе {totalReviews} отзывов</span>
          </div>

          <Button
            onClick={() => setShowForm(!showForm)}
            className="mt-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600"
          >
            <Icon name="MessageSquarePlus" className="w-4 h-4 mr-2" />
            Оставить отзыв
          </Button>
        </div>

        {showForm && (
          <div className="max-w-2xl mx-auto mb-12 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-red-500/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Напишите ваш отзыв</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Ваше имя *</label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Александр М."
                    className="bg-gray-800/50 border-gray-700"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Город *</label>
                  <Input
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Москва"
                    className="bg-gray-800/50 border-gray-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Ваш тариф *</label>
                  <select
                    required
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-md px-3 py-2 text-white"
                  >
                    <option value="">Выберите тариф</option>
                    <option value="7 дней">7 дней</option>
                    <option value="1 месяц">1 месяц</option>
                    <option value="3 месяца">3 месяца</option>
                    <option value="6 месяцев">6 месяцев</option>
                    <option value="12 месяцев">12 месяцев</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Email (необязательно)</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="bg-gray-800/50 border-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Оценка *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          rating <= formData.rating
                            ? 'fill-yellow-500 text-yellow-500'
                            : 'text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Ваш отзыв *</label>
                <Textarea
                  required
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Расскажите о вашем опыте использования Speed VPN..."
                  className="bg-gray-800/50 border-gray-700 min-h-[120px]"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    'Отправить отзыв'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="border-gray-700"
                >
                  Отмена
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.slice((currentPage - 1) * reviewsPerPage, currentPage * reviewsPerPage).map((review) => (
            <div
              key={review.id}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-red-500/20 rounded-2xl p-6 hover:border-red-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold text-lg">{review.name}</h3>
                  <p className="text-gray-400 text-sm">{review.location}</p>
                </div>
                <Quote className="w-8 h-8 text-red-500/30" />
              </div>

              <div className="flex items-center gap-1 mb-3">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                ))}
              </div>

              <p className="text-gray-300 leading-relaxed mb-4">
                {review.text}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                <span className="text-xs text-gray-500">{review.date}</span>
                <span className="text-xs bg-red-500/10 text-red-400 px-3 py-1 rounded-full">
                  {review.plan}
                </span>
              </div>
            </div>
          ))}
        </div>

        {reviews.length > reviewsPerPage && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <Button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              variant="outline"
              className="border-gray-700 text-gray-400 hover:bg-red-600 hover:text-white disabled:opacity-50"
            >
              <Icon name="ChevronLeft" size={20} />
            </Button>
            
            <div className="flex gap-2">
              {Array.from({ length: Math.ceil(reviews.length / reviewsPerPage) }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  variant={currentPage === page ? 'default' : 'outline'}
                  className={currentPage === page 
                    ? 'bg-gradient-to-r from-red-600 to-red-700' 
                    : 'border-gray-700 text-gray-400 hover:bg-red-600 hover:text-white'
                  }
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              onClick={() => setCurrentPage(p => Math.min(Math.ceil(reviews.length / reviewsPerPage), p + 1))}
              disabled={currentPage === Math.ceil(reviews.length / reviewsPerPage)}
              variant="outline"
              className="border-gray-700 text-gray-400 hover:bg-red-600 hover:text-white disabled:opacity-50"
            >
              <Icon name="ChevronRight" size={20} />
            </Button>
          </div>
        )}

        <div className="mt-16 text-center bg-gradient-to-br from-red-500/10 to-red-600/5 backdrop-blur-sm border border-red-500/20 rounded-2xl p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Присоединяйтесь к тысячам довольных клиентов!
          </h2>
          <p className="text-gray-400 mb-6">
            Начните пользоваться Speed VPN уже сегодня и убедитесь сами в качестве нашего сервиса
          </p>
          <button
            onClick={() => navigate('/register')}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-red-500/50"
          >
            Получить доступ
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default Reviews;