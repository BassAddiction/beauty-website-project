import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const FUNC2URL = {
  'admin-reviews': 'https://functions.poehali.dev/49344173-2053-4177-8e8e-9000c3f9ac42'
};

interface Review {
  id: number;
  name: string;
  location: string;
  rating: number;
  plan: string;
  text: string;
  email: string;
  date: string;
  is_approved: boolean;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const adminToken = localStorage.getItem('admin_token');
  const adminUsername = localStorage.getItem('admin_username');

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }
    fetchReviews();
  }, [filter, adminToken, navigate]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${FUNC2URL['admin-reviews']}?status=${filter}`, {
        headers: {
          'X-Admin-Token': adminToken!
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_username');
        navigate('/admin/login');
        return;
      }

      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить отзывы',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (reviewId: number, action: 'approve' | 'reject' | 'delete') => {
    try {
      const method = action === 'delete' ? 'DELETE' : 'PUT';
      const body = action === 'delete' 
        ? JSON.stringify({ id: reviewId })
        : JSON.stringify({ id: reviewId, action });

      const response = await fetch(FUNC2URL['admin-reviews'], {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken!
        },
        body
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: action === 'delete' ? 'Отзыв удалён' : `Отзыв ${action === 'approve' ? 'одобрен' : 'отклонён'}`
        });
        fetchReviews();
      } else {
        throw new Error('Action failed');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось выполнить действие',
        variant: 'destructive'
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-900 border-2 border-red-600 rounded-xl p-6 shadow-2xl shadow-red-600/20 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center shadow-lg shadow-red-600/50">
                <Icon name="ShieldCheck" size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Админ-панель</h1>
                <p className="text-red-300 text-sm">Добро пожаловать, {adminUsername}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
            >
              <Icon name="LogOut" size={18} className="mr-2" />
              Выйти
            </Button>
          </div>
        </div>

        <div className="bg-gray-900 border-2 border-red-600 rounded-xl p-6 shadow-2xl shadow-red-600/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Управление отзывами</h2>
            <div className="flex gap-2">
              <Button
                onClick={() => setFilter('pending')}
                variant={filter === 'pending' ? 'default' : 'outline'}
                className={filter === 'pending' ? 'bg-red-600 hover:bg-red-700' : 'border-gray-700 text-gray-400'}
              >
                Ожидают ({reviews.filter(r => !r.is_approved).length})
              </Button>
              <Button
                onClick={() => setFilter('approved')}
                variant={filter === 'approved' ? 'default' : 'outline'}
                className={filter === 'approved' ? 'bg-red-600 hover:bg-red-700' : 'border-gray-700 text-gray-400'}
              >
                Одобрены
              </Button>
              <Button
                onClick={() => setFilter('all')}
                variant={filter === 'all' ? 'default' : 'outline'}
                className={filter === 'all' ? 'bg-red-600 hover:bg-red-700' : 'border-gray-700 text-gray-400'}
              >
                Все
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Icon name="Loader2" size={48} className="text-red-600 animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-20">
              <Icon name="FileText" size={64} className="text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Нет отзывов в этой категории</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className={`bg-gray-800 border-2 rounded-lg p-6 ${
                    review.is_approved ? 'border-green-600' : 'border-yellow-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold text-lg">{review.name}</h3>
                        <span className="text-red-400 text-sm">• {review.location}</span>
                        <span className="text-gray-500 text-sm">• {review.plan}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Icon
                              key={i}
                              name="Star"
                              size={16}
                              className={i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}
                            />
                          ))}
                        </div>
                        <span className="text-gray-500 text-sm">{review.date}</span>
                      </div>
                      <p className="text-gray-300 mb-3">{review.text}</p>
                      {review.email && (
                        <p className="text-gray-500 text-sm">Email: {review.email}</p>
                      )}
                    </div>
                    <div className="ml-4">
                      {review.is_approved ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-600/20 text-green-400 text-sm font-medium">
                          <Icon name="CheckCircle" size={16} className="mr-1" />
                          Одобрен
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-600/20 text-yellow-400 text-sm font-medium">
                          <Icon name="Clock" size={16} className="mr-1" />
                          Ожидает
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-700">
                    {!review.is_approved && (
                      <Button
                        onClick={() => handleAction(review.id, 'approve')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Icon name="Check" size={18} className="mr-2" />
                        Одобрить
                      </Button>
                    )}
                    {review.is_approved && (
                      <Button
                        onClick={() => handleAction(review.id, 'reject')}
                        variant="outline"
                        className="border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-white"
                      >
                        <Icon name="X" size={18} className="mr-2" />
                        Отклонить
                      </Button>
                    )}
                    <Button
                      onClick={() => handleAction(review.id, 'delete')}
                      variant="outline"
                      className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                    >
                      <Icon name="Trash2" size={18} className="mr-2" />
                      Удалить
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}