import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useSEO } from "@/hooks/useSEO";
import { pageSEO, createWebPageSchema } from "@/utils/seo";

const VpnInstagramPage = () => {
  const webPageSchema = createWebPageSchema({
    name: 'VPN для Instagram',
    description: 'Пользуйтесь Instagram без ограничений с Speed VPN',
    url: 'https://speedvpn.io/vpn-instagram'
  });

  useSEO({
    ...pageSEO.vpnInstagram,
    structuredData: webPageSchema
  });

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              VPN для Instagram — Доступ без ограничений
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Смотрите Stories, Reels, публикуйте посты и общайтесь с друзьями в Instagram с Speed VPN
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="rounded-full button-glow" asChild>
                <a href="/#pricing">
                  <Icon name="Zap" className="w-5 h-5 mr-2" />
                  Подключить VPN от 79₽
                </a>
              </Button>
            </div>
          </div>

          <div className="mb-12 rounded-2xl overflow-hidden">
            <img 
              src="https://cdn.poehali.dev/files/a723c7b2-8fbc-4b21-b03e-eea510930592.jpg"
              alt="Instagram работает через Speed VPN"
              className="w-full h-auto"
            />
          </div>

          <div className="prose prose-invert max-w-none">
            <h2 className="text-3xl font-bold text-white mb-6">
              Почему нужен VPN для Instagram в России?
            </h2>
            <p className="text-gray-300 mb-6 text-lg leading-relaxed">
              Instagram заблокирован в России с марта 2022 года. Без VPN вы не сможете просматривать ленту, публиковать фото и видео, смотреть Stories и Reels, общаться в Direct.
            </p>
            <p className="text-gray-300 mb-8 text-lg leading-relaxed">
              Speed VPN обеспечивает стабильное подключение к Instagram с высокой скоростью загрузки контента. Vless Reality протокол гарантирует, что ваше соединение не будет обнаружено и заблокировано.
            </p>

            <h2 className="text-3xl font-bold text-white mb-6">
              Возможности Instagram с Speed VPN
            </h2>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Icon name="Check" className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <span className="text-gray-300 text-lg">
                  <strong className="text-white">Смотрите Stories и Reels</strong> — просматривайте истории друзей и короткие видео без задержек
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="Check" className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <span className="text-gray-300 text-lg">
                  <strong className="text-white">Публикуйте посты</strong> — делитесь фотографиями и видео, добавляйте фильтры и эффекты
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="Check" className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <span className="text-gray-300 text-lg">
                  <strong className="text-white">Общайтесь в Direct</strong> — переписывайтесь с друзьями, отправляйте фото и голосовые сообщения
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="Check" className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <span className="text-gray-300 text-lg">
                  <strong className="text-white">Смотрите прямые эфиры</strong> — следите за трансляциями любимых блогеров в реальном времени
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="Check" className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <span className="text-gray-300 text-lg">
                  <strong className="text-white">Ведите бизнес-аккаунт</strong> — управляйте магазином, смотрите статистику, общайтесь с клиентами
                </span>
              </li>
            </ul>

            <h2 className="text-3xl font-bold text-white mb-6">
              Преимущества Speed VPN для Instagram
            </h2>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-card/50 border border-border rounded-xl p-6">
                <Icon name="Zap" className="w-8 h-8 text-primary mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Высокая скорость</h3>
                <p className="text-gray-400">
                  Загружайте фото и видео моментально, смотрите Reels в HD качестве без буферизации
                </p>
              </div>
              <div className="bg-card/50 border border-border rounded-xl p-6">
                <Icon name="Shield" className="w-8 h-8 text-primary mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Vless Reality</h3>
                <p className="text-gray-400">
                  Современный протокол не обнаруживается системами блокировки Роскомнадзора
                </p>
              </div>
              <div className="bg-card/50 border border-border rounded-xl p-6">
                <Icon name="Smartphone" className="w-8 h-8 text-primary mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Все устройства</h3>
                <p className="text-gray-400">
                  Используйте Instagram на телефоне, планшете и компьютере одновременно
                </p>
              </div>
              <div className="bg-card/50 border border-border rounded-xl p-6">
                <Icon name="Clock" className="w-8 h-8 text-primary mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Стабильность 24/7</h3>
                <p className="text-gray-400">
                  Подключение не прерывается, работает круглосуточно без сбоев
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-6">
              Как подключить Instagram через VPN?
            </h2>
            <ol className="space-y-4 mb-8 list-none">
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                  1
                </span>
                <div>
                  <strong className="text-white text-lg">Выберите тариф Speed VPN</strong>
                  <p className="text-gray-400 mt-1">От 79₽ за неделю — выберите подходящий план подписки</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                  2
                </span>
                <div>
                  <strong className="text-white text-lg">Скачайте VPN-клиент</strong>
                  <p className="text-gray-400 mt-1">Happ или V2RayTun — доступны для iOS, Android, Windows, Mac</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                  3
                </span>
                <div>
                  <strong className="text-white text-lg">Добавьте подписку в приложение</strong>
                  <p className="text-gray-400 mt-1">Скопируйте ссылку из личного кабинета и импортируйте в клиент</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                  4
                </span>
                <div>
                  <strong className="text-white text-lg">Подключитесь и используйте Instagram</strong>
                  <p className="text-gray-400 mt-1">Откройте приложение Instagram и пользуйтесь без ограничений</p>
                </div>
              </li>
            </ol>

            <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 mb-8">
              <div className="flex gap-4">
                <Icon name="Info" className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Совет</h3>
                  <p className="text-gray-300">
                    Для лучшей работы Instagram рекомендуем выбирать серверы в Европе (Германия, Нидерланды, Финляндия). 
                    Они обеспечивают оптимальную скорость для загрузки фото и видео.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-12 mb-8">
              <h2 className="text-3xl font-bold text-white mb-6">
                Начните пользоваться Instagram прямо сейчас
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Speed VPN — надёжный доступ к Instagram от 79₽/неделя
              </p>
              <Button size="lg" className="rounded-full button-glow text-lg px-8" asChild>
                <a href="/#pricing">
                  <Icon name="Zap" className="w-5 h-5 mr-2" />
                  Выбрать тариф
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default VpnInstagramPage;