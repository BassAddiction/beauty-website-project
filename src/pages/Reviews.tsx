import { Star, Quote } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const reviews = [
  {
    id: 1,
    name: "Александр М.",
    location: "Москва",
    rating: 5,
    date: "15 октября 2024",
    text: "Лучший VPN из всех, что я пробовал! Скорость просто космическая, никаких обрывов. Особенно радует, что работает на всех устройствах по одной подписке.",
    plan: "Год"
  },
  {
    id: 2,
    name: "Мария К.",
    location: "Санкт-Петербург",
    rating: 5,
    date: "3 ноября 2024",
    text: "Пользуюсь уже 3 месяца — полный восторг! Все сайты открываются мгновенно, видео в HD без тормозов. Поддержка очень отзывчивая, помогли настроить за 5 минут.",
    plan: "3 месяца"
  },
  {
    id: 3,
    name: "Дмитрий В.",
    location: "Екатеринбург",
    rating: 5,
    date: "28 октября 2024",
    text: "Раньше юзал другие VPN, но там были постоянные лаги. Speed VPN работает стабильно 24/7, цена адекватная. Всем советую!",
    plan: "Месяц"
  },
  {
    id: 4,
    name: "Елена С.",
    location: "Казань",
    rating: 5,
    date: "12 ноября 2024",
    text: "Идеальное соотношение цены и качества. Подключение за секунды, интерфейс понятный даже для новичка. Защита данных на высоте!",
    plan: "Год"
  },
  {
    id: 5,
    name: "Игорь Т.",
    location: "Новосибирск",
    rating: 5,
    date: "7 ноября 2024",
    text: "Работаю удаленно, VPN нужен постоянно. Speed VPN не подводит — связь стабильная, пинг низкий. Годовая подписка окупилась за месяц!",
    plan: "Год"
  },
  {
    id: 6,
    name: "Ольга Н.",
    location: "Краснодар",
    rating: 5,
    date: "1 ноября 2024",
    text: "Очень довольна! Смотрю стримы в 4К без буферизации. Настроила на телефоне и ноутбуке — везде работает безупречно. Спасибо за качественный сервис!",
    plan: "3 месяца"
  }
];

const Reviews = () => {
  const navigate = useNavigate();

  return (
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
            <span className="text-white font-semibold text-xl">5.0</span>
            <span className="text-gray-400">на основе 1,247 отзывов</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
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
  );
};

export default Reviews;
