import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useSEO } from "@/hooks/useSEO";
import { pageSEO, createWebPageSchema } from "@/utils/seo";

const VpnTwitterPage = () => {
  const webPageSchema = createWebPageSchema({
    name: 'VPN для X (Twitter)',
    description: 'Доступ к X (Twitter) без ограничений с Speed VPN',
    url: 'https://speedvpn.io/vpn-twitter'
  });

  useSEO({
    ...pageSEO.vpnTwitter,
    structuredData: webPageSchema
  });

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              VPN для X (Twitter) — Полный доступ из России
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Читайте твиты, публикуйте посты и смотрите видео в X (бывший Twitter) с Speed VPN
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
              src="https://cdn.poehali.dev/files/ce3c2f14-2ee3-46b2-acee-89296479b8cd.jpg"
              alt="X (Twitter) работает через Speed VPN"
              className="w-full h-auto"
            />
          </div>

          <div className="prose prose-invert max-w-none">
            <h2 className="text-3xl font-bold text-white mb-6">
              Почему X (Twitter) недоступен в России?
            </h2>
            <p className="text-gray-300 mb-6 text-lg leading-relaxed">
              С марта 2022 года доступ к Twitter (теперь X) ограничен в России. Платформа замедлена и частично заблокирована, 
              что делает невозможным нормальное использование: посты не загружаются, видео не воспроизводятся, уведомления не приходят.
            </p>
            <p className="text-gray-300 mb-8 text-lg leading-relaxed">
              Speed VPN восстанавливает полный доступ к X. Благодаря современному протоколу Vless Reality, 
              соединение остаётся стабильным и быстрым, обходя все блокировки Роскомнадзора.
            </p>

            <h2 className="text-3xl font-bold text-white mb-6">
              Возможности X с Speed VPN
            </h2>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Icon name="Check" className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <span className="text-gray-300 text-lg">
                  <strong className="text-white">Лента твитов</strong> — читайте посты от друзей, знаменитостей и новостных агентств
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="Check" className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <span className="text-gray-300 text-lg">
                  <strong className="text-white">Публикация постов</strong> — пишите твиты, добавляйте фото, видео и GIF
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="Check" className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <span className="text-gray-300 text-lg">
                  <strong className="text-white">X Spaces</strong> — слушайте аудио-комнаты и общайтесь голосом в прямом эфире
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="Check" className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <span className="text-gray-300 text-lg">
                  <strong className="text-white">Видео контент</strong> — смотрите видео в высоком качестве без буферизации
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="Check" className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <span className="text-gray-300 text-lg">
                  <strong className="text-white">Личные сообщения</strong> — переписывайтесь с друзьями в Direct Messages
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="Check" className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <span className="text-gray-300 text-lg">
                  <strong className="text-white">Тренды и хэштеги</strong> — следите за актуальными темами и обсуждениями
                </span>
              </li>
            </ul>

            <h2 className="text-3xl font-bold text-white mb-6">
              Преимущества Speed VPN для X (Twitter)
            </h2>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-card/50 border border-border rounded-xl p-6">
                <Icon name="Rocket" className="w-8 h-8 text-primary mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Мгновенная загрузка</h3>
                <p className="text-gray-400">
                  Лента обновляется моментально, видео воспроизводятся без задержек
                </p>
              </div>
              <div className="bg-card/50 border border-border rounded-xl p-6">
                <Icon name="Lock" className="w-8 h-8 text-primary mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Обход блокировок</h3>
                <p className="text-gray-400">
                  Vless Reality не определяется DPI-системами и работает без сбоев
                </p>
              </div>
              <div className="bg-card/50 border border-border rounded-xl p-6">
                <Icon name="Users" className="w-8 h-8 text-primary mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Множество устройств</h3>
                <p className="text-gray-400">
                  Пользуйтесь X на всех устройствах: телефон, планшет, компьютер
                </p>
              </div>
              <div className="bg-card/50 border border-border rounded-xl p-6">
                <Icon name="Signal" className="w-8 h-8 text-primary mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">99.9% аптайм</h3>
                <p className="text-gray-400">
                  Серверы работают стабильно 24/7, без отключений и технических сбоев
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-6">
              Как открыть X (Twitter) через VPN?
            </h2>
            <ol className="space-y-4 mb-8 list-none">
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                  1
                </span>
                <div>
                  <strong className="text-white text-lg">Оформите подписку Speed VPN</strong>
                  <p className="text-gray-400 mt-1">Тарифы от 79₽/неделя — все планы поддерживают X (Twitter)</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                  2
                </span>
                <div>
                  <strong className="text-white text-lg">Скачайте VPN-приложение</strong>
                  <p className="text-gray-400 mt-1">Happ или V2RayTun — доступны на iOS, Android, Windows, macOS, Linux</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                  3
                </span>
                <div>
                  <strong className="text-white text-lg">Добавьте конфигурацию</strong>
                  <p className="text-gray-400 mt-1">Скопируйте ссылку подписки из личного кабинета Speed VPN</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                  4
                </span>
                <div>
                  <strong className="text-white text-lg">Подключитесь и откройте X</strong>
                  <p className="text-gray-400 mt-1">Нажмите "Подключить" в приложении — X заработает мгновенно</p>
                </div>
              </li>
            </ol>

            <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 mb-8">
              <div className="flex gap-4">
                <Icon name="Target" className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Оптимальные серверы</h3>
                  <p className="text-gray-300">
                    Для X (Twitter) рекомендуем серверы в США и Европе. Они обеспечивают наилучшую скорость 
                    загрузки ленты, видео и изображений. Серверы в Германии, Финляндии и Нидерландах показывают 
                    стабильный пинг 50-80 мс из России.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-6">
              Популярные вопросы о X и VPN
            </h2>
            <div className="space-y-6 mb-8">
              <div className="bg-card/30 border border-border rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-3">
                  X Premium работает через VPN?
                </h3>
                <p className="text-gray-300">
                  Да, все функции X Premium (Blue) полностью работают через Speed VPN: редактирование твитов, 
                  длинные посты, приоритет в ответах, верификация.
                </p>
              </div>
              <div className="bg-card/30 border border-border rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-3">
                  Можно ли использовать X на смартфоне?
                </h3>
                <p className="text-gray-300">
                  Да, установите Happ или V2RayTun на iOS или Android, подключите VPN и откройте приложение X. 
                  Всё будет работать как обычно: push-уведомления, прямые эфиры, загрузка медиа.
                </p>
              </div>
              <div className="bg-card/30 border border-border rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-3">
                  Заблокирует ли X мой аккаунт?
                </h3>
                <p className="text-gray-300">
                  Нет, использование VPN не нарушает правила X (Twitter). Миллионы пользователей из разных стран 
                  используют VPN для доступа к платформе — это нормальная практика.
                </p>
              </div>
              <div className="bg-card/30 border border-border rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-3">
                  Можно ли смотреть X Spaces через VPN?
                </h3>
                <p className="text-gray-300">
                  Да, Speed VPN обеспечивает стабильное соединение для прослушивания и участия в X Spaces. 
                  Аудио воспроизводится без прерываний и задержек.
                </p>
              </div>
            </div>

            <div className="text-center mt-12 mb-8">
              <h2 className="text-3xl font-bold text-white mb-6">
                Начните пользоваться X (Twitter) без ограничений
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Speed VPN — надёжный доступ к X от 79₽/неделя
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
    </>
  );
};

export default VpnTwitterPage;