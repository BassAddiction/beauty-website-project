import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useSEO } from "@/hooks/useSEO";
import { pageSEO, createWebPageSchema } from "@/utils/seo";

const VpnFacebookPage = () => {
  const webPageSchema = createWebPageSchema({
    name: 'VPN для Facebook',
    description: 'Используйте Facebook без блокировок с Speed VPN',
    url: 'https://speedvpn.io/vpn-facebook'
  });

  useSEO({
    ...pageSEO.vpnFacebook,
    structuredData: webPageSchema
  });

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              VPN для Facebook — Стабильный доступ к соцсети
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Общайтесь с друзьями, смотрите видео и публикуйте посты в Facebook с Speed VPN
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
              src="https://cdn.poehali.dev/files/8d467536-0939-4846-af54-6c838202e269.jpg"
              alt="Facebook работает через Speed VPN"
              className="w-full h-auto"
            />
          </div>

          <div className="prose prose-invert max-w-none">
            <h2 className="text-3xl font-bold text-white mb-6">
              Зачем нужен VPN для Facebook?
            </h2>
            <p className="text-gray-300 mb-6 text-lg leading-relaxed">
              Facebook и его сервисы (включая Messenger) заблокированы в России. Доступ к платформе ограничен, 
              и без надёжного VPN вы не сможете общаться с друзьями, просматривать новости, участвовать в группах и вести бизнес-страницы.
            </p>
            <p className="text-gray-300 mb-8 text-lg leading-relaxed">
              Speed VPN предоставляет быстрое и стабильное подключение к Facebook. Технология Vless Reality 
              обеспечивает обход блокировок Роскомнадзора, сохраняя высокую скорость загрузки контента.
            </p>

            <h2 className="text-3xl font-bold text-white mb-6">
              Что доступно в Facebook с Speed VPN?
            </h2>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Icon name="Check" className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <span className="text-gray-300 text-lg">
                  <strong className="text-white">Лента новостей</strong> — просматривайте публикации друзей, страниц и групп
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="Check" className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <span className="text-gray-300 text-lg">
                  <strong className="text-white">Messenger</strong> — общайтесь с друзьями, совершайте видеозвонки, отправляйте файлы
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="Check" className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <span className="text-gray-300 text-lg">
                  <strong className="text-white">Группы и сообщества</strong> — участвуйте в обсуждениях, создавайте собственные группы
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="Check" className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <span className="text-gray-300 text-lg">
                  <strong className="text-white">Facebook Marketplace</strong> — покупайте и продавайте товары, находите услуги
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="Check" className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <span className="text-gray-300 text-lg">
                  <strong className="text-white">Бизнес-страницы</strong> — управляйте компанией, публикуйте рекламу, анализируйте статистику
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="Check" className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <span className="text-gray-300 text-lg">
                  <strong className="text-white">Facebook Watch</strong> — смотрите видео, прямые трансляции и сериалы
                </span>
              </li>
            </ul>

            <h2 className="text-3xl font-bold text-white mb-6">
              Преимущества Speed VPN для Facebook
            </h2>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-card/50 border border-border rounded-xl p-6">
                <Icon name="Gauge" className="w-8 h-8 text-primary mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Быстрая загрузка</h3>
                <p className="text-gray-400">
                  Смотрите видео, листайте ленту и загружайте фото без задержек
                </p>
              </div>
              <div className="bg-card/50 border border-border rounded-xl p-6">
                <Icon name="ShieldCheck" className="w-8 h-8 text-primary mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Надёжная защита</h3>
                <p className="text-gray-400">
                  Vless Reality протокол не обнаруживается системами DPI Роскомнадзора
                </p>
              </div>
              <div className="bg-card/50 border border-border rounded-xl p-6">
                <Icon name="Laptop" className="w-8 h-8 text-primary mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Безлимитные устройства</h3>
                <p className="text-gray-400">
                  Используйте Facebook на телефоне, планшете, компьютере одновременно
                </p>
              </div>
              <div className="bg-card/50 border border-border rounded-xl p-6">
                <Icon name="Globe" className="w-8 h-8 text-primary mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Серверы по всему миру</h3>
                <p className="text-gray-400">
                  Подключайтесь через серверы в Европе, США и Азии для лучшей скорости
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-6">
              Как использовать Facebook через VPN?
            </h2>
            <ol className="space-y-4 mb-8 list-none">
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                  1
                </span>
                <div>
                  <strong className="text-white text-lg">Купите подписку Speed VPN</strong>
                  <p className="text-gray-400 mt-1">Выберите тариф от 79₽/неделя — все планы поддерживают Facebook</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                  2
                </span>
                <div>
                  <strong className="text-white text-lg">Установите VPN-клиент</strong>
                  <p className="text-gray-400 mt-1">Скачайте Happ или V2RayTun для вашего устройства (iOS, Android, Windows, Mac)</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                  3
                </span>
                <div>
                  <strong className="text-white text-lg">Импортируйте конфигурацию</strong>
                  <p className="text-gray-400 mt-1">Скопируйте ссылку подписки из личного кабинета в приложение</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                  4
                </span>
                <div>
                  <strong className="text-white text-lg">Подключитесь к VPN</strong>
                  <p className="text-gray-400 mt-1">Выберите сервер и нажмите "Подключить" — Facebook откроется мгновенно</p>
                </div>
              </li>
            </ol>

            <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 mb-8">
              <div className="flex gap-4">
                <Icon name="Lightbulb" className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Рекомендация</h3>
                  <p className="text-gray-300">
                    Для работы с Facebook Messenger и видеозвонков выбирайте серверы с пингом до 100 мс. 
                    Серверы в Германии, Финляндии и Нидерландах показывают лучшую производительность для России.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-6">
              Часто задаваемые вопросы
            </h2>
            <div className="space-y-6 mb-8">
              <div className="bg-card/30 border border-border rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-3">
                  Можно ли использовать Facebook на телефоне через VPN?
                </h3>
                <p className="text-gray-300">
                  Да, Speed VPN поддерживает все платформы. Установите Happ или V2RayTun на iOS/Android, 
                  импортируйте подписку и используйте приложение Facebook без ограничений.
                </p>
              </div>
              <div className="bg-card/30 border border-border rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-3">
                  Будет ли работать Messenger?
                </h3>
                <p className="text-gray-300">
                  Да, после подключения к Speed VPN все сервисы Facebook работают полностью: Messenger, 
                  видеозвонки, голосовые сообщения, отправка файлов.
                </p>
              </div>
              <div className="bg-card/30 border border-border rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-3">
                  Заблокирует ли Facebook мой аккаунт при использовании VPN?
                </h3>
                <p className="text-gray-300">
                  Нет, использование VPN не нарушает правила Facebook. Миллионы пользователей по всему миру 
                  используют VPN для доступа к соцсети, и это абсолютно безопасно.
                </p>
              </div>
            </div>

            <div className="text-center mt-12 mb-8">
              <h2 className="text-3xl font-bold text-white mb-6">
                Получите доступ к Facebook прямо сейчас
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Speed VPN — стабильное подключение к Facebook от 79₽/неделя
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

export default VpnFacebookPage;