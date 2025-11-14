import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import Icon from '@/components/ui/icon';
import { NewYearTheme } from "@/components/NewYearTheme";

const VpnTelegram = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'VPN для Telegram в России 2025 — Speed VPN от 79₽/мес';
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Надежный VPN для Telegram в России. Быстрое подключение на iOS, Android, Windows, Mac. Доступ к каналам без блокировок. Тарифы от 79 рублей.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <NewYearTheme />
      <Header />
      
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="mb-8 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Главная</Link>
            <span className="mx-2">/</span>
            <span>VPN для Telegram</span>
          </nav>

          {/* Hero */}
          <div className="mb-12">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              VPN для Telegram в России — Speed VPN
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Telegram периодически тормозит или не загружает каналы? Speed VPN обеспечивает стабильный доступ ко всем функциям мессенджера без ограничений.
            </p>
          </div>

          {/* Quick CTA */}
          <div className="bg-gradient-to-br from-primary/10 to-purple-600/10 rounded-2xl p-8 mb-12 border border-primary/20">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/20 rounded-xl">
                <Icon name="Send" className="text-primary" size={32} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3">Telegram без тормозов за 79₽</h2>
                <p className="text-muted-foreground mb-4">
                  Speed VPN мгновенно устраняет проблемы с загрузкой медиа в Telegram. Подключается за 2 минуты на любом устройстве.
                </p>
                <Link 
                  to="/#pricing" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-semibold"
                >
                  Подключить Speed VPN
                  <Icon name="ArrowRight" size={20} />
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <article className="prose prose-lg max-w-none">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
              <Icon name="MessageCircle" className="text-primary" size={36} />
              Почему Telegram работает медленно без VPN
            </h2>
            
            <p className="text-muted-foreground leading-relaxed mb-6">
              С 2018 года в России действуют ограничения на работу Telegram. Хотя мессенджер не заблокирован полностью, провайдеры замедляют скорость подключения к серверам. Это приводит к долгой загрузке фото, видео и голосовых сообщений. VPN решает эту проблему, обеспечивая прямое соединение с серверами Telegram.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold mb-6 mt-12">
              Как подключить VPN для Telegram
            </h2>

            <div className="space-y-8">
              {/* Step 1 */}
              <div className="bg-card rounded-xl p-6 border">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-3">Выберите тариф Speed VPN</h3>
                    <p className="text-muted-foreground mb-3">
                      Для Telegram подойдет любой план — даже базовый за 79₽ обеспечит стабильную работу мессенджера на всех устройствах.
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>30 ГБ трафика в день — достаточно для любого использования Telegram</li>
                      <li>Подключение без ограничений по количеству устройств</li>
                      <li>Мгновенная активация сразу после оплаты</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-card rounded-xl p-6 border">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-3">Получите конфигурацию VPN</h3>
                    <p className="text-muted-foreground mb-3">
                      После оплаты на speedvpn.io вы моментально получите ссылку для подключения и пошаговую инструкцию на email. Никаких задержек — всё автоматизировано.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-card rounded-xl p-6 border">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-3">Установите клиент для подключения</h3>
                    <p className="text-muted-foreground mb-4">
                      Speed VPN работает через приложения v2rayN или Hiddify. Они бесплатные и занимают 2 минуты на установку:
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="p-4 bg-background/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name="Smartphone" className="text-primary" size={20} />
                          <span className="font-semibold">Телефон</span>
                        </div>
                        <p className="text-sm text-muted-foreground">iOS: Hiddify из App Store<br/>Android: Hiddify из Google Play</p>
                      </div>
                      <div className="p-4 bg-background/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name="Monitor" className="text-primary" size={20} />
                          <span className="font-semibold">Компьютер</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Windows/Mac: приложение v2rayN<br/>Ссылка придёт на почту</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-card rounded-xl p-6 border">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-3">Импортируйте настройки и подключитесь</h3>
                    <p className="text-muted-foreground mb-3">
                      Откройте приложение, нажмите кнопку импорта и вставьте ссылку из письма. Или просто отсканируйте QR-код. Готово — Telegram теперь работает на полной скорости!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 border-l-4 border-primary rounded-r-xl p-6 my-12">
              <div className="flex items-start gap-3">
                <Icon name="Video" className="text-primary flex-shrink-0 mt-1" size={24} />
                <div>
                  <p className="font-semibold mb-2">Видеоинструкция по установке</p>
                  <p className="text-muted-foreground">
                    На <Link to="/#training" className="text-primary hover:underline">главной странице speedvpn.io</Link> есть подробное видео по настройке VPN на всех платформах. Всё покажем пошагово.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-6 mt-12">
              Почему Speed VPN — лучший выбор для Telegram
            </h2>

            <div className="grid gap-6 md:grid-cols-2 my-8">
              <div className="p-6 bg-card rounded-xl border">
                <Icon name="Zap" className="text-primary mb-3" size={32} />
                <h3 className="font-bold text-lg mb-2">Мгновенная загрузка медиа</h3>
                <p className="text-muted-foreground text-sm">
                  Speed VPN использует протокол Vless Reality — фото, видео и голосовые загружаются так же быстро, как без блокировок.
                </p>
              </div>

              <div className="p-6 bg-card rounded-xl border">
                <Icon name="Infinity" className="text-primary mb-3" size={32} />
                <h3 className="font-bold text-lg mb-2">Все устройства в одной подписке</h3>
                <p className="text-muted-foreground text-sm">
                  Подключите Telegram на телефоне, планшете, компьютере — одна подписка speedvpn.io работает на всех гаджетах одновременно.
                </p>
              </div>

              <div className="p-6 bg-card rounded-xl border">
                <Icon name="Shield" className="text-primary mb-3" size={32} />
                <h3 className="font-bold text-lg mb-2">Полная конфиденциальность</h3>
                <p className="text-muted-foreground text-sm">
                  Speed VPN не хранит логи переписок и не отслеживает активность. Ваши сообщения остаются только у вас.
                </p>
              </div>

              <div className="p-6 bg-card rounded-xl border">
                <Icon name="TrendingUp" className="text-primary mb-3" size={32} />
                <h3 className="font-bold text-lg mb-2">Стабильность 24/7</h3>
                <p className="text-muted-foreground text-sm">
                  Наши серверы работают круглосуточно. Telegram не отвалится в самый нужный момент — гарантируем надёжность.
                </p>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-6 mt-12">
              Что даёт VPN для Telegram
            </h2>

            <div className="bg-card rounded-xl p-6 border mb-8">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Icon name="Check" className="text-primary flex-shrink-0 mt-1" size={20} />
                  <div>
                    <span className="font-semibold">Быстрая загрузка медиафайлов</span>
                    <p className="text-sm text-muted-foreground">Видео, фото и голосовые сообщения открываются мгновенно</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="Check" className="text-primary flex-shrink-0 mt-1" size={20} />
                  <div>
                    <span className="font-semibold">Доступ ко всем каналам</span>
                    <p className="text-sm text-muted-foreground">Никаких ограничений — подписывайтесь на любые каналы без блокировок</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="Check" className="text-primary flex-shrink-0 mt-1" size={20} />
                  <div>
                    <span className="font-semibold">Стабильные звонки и видеосвязь</span>
                    <p className="text-sm text-muted-foreground">Голосовые и видеозвонки без обрывов и задержек</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="Check" className="text-primary flex-shrink-0 mt-1" size={20} />
                  <div>
                    <span className="font-semibold">Работа Telegram Premium функций</span>
                    <p className="text-sm text-muted-foreground">Все премиум-возможности работают на полной скорости</p>
                  </div>
                </li>
              </ul>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-6 mt-12">
              Часто задаваемые вопросы про VPN для Telegram
            </h2>

            <div className="space-y-4">
              <details className="group bg-card rounded-xl p-6 border cursor-pointer">
                <summary className="font-semibold text-lg list-none flex items-center justify-between">
                  Будет ли Telegram работать быстрее с Speed VPN?
                  <Icon name="ChevronDown" className="group-open:rotate-180 transition-transform" size={20} />
                </summary>
                <p className="text-muted-foreground mt-4">
                  Да! Speed VPN устраняет замедления от провайдера. Медиафайлы будут загружаться так же быстро, как в странах без блокировок. Наш протокол Vless Reality обеспечивает максимальную скорость.
                </p>
              </details>

              <details className="group bg-card rounded-xl p-6 border cursor-pointer">
                <summary className="font-semibold text-lg list-none flex items-center justify-between">
                  Можно ли использовать один аккаунт Speed VPN на телефоне и компьютере?
                  <Icon name="ChevronDown" className="group-open:rotate-180 transition-transform" size={20} />
                </summary>
                <p className="text-muted-foreground mt-4">
                  Да, одна подписка speedvpn.io работает на неограниченном количестве устройств. Настройте VPN на всех гаджетах, где используете Telegram.
                </p>
              </details>

              <details className="group bg-card rounded-xl p-6 border cursor-pointer">
                <summary className="font-semibold text-lg list-none flex items-center justify-between">
                  Замедлит ли VPN скорость интернета?
                  <Icon name="ChevronDown" className="group-open:rotate-180 transition-transform" size={20} />
                </summary>
                <p className="text-muted-foreground mt-4">
                  Нет. Speed VPN использует современные технологии — потери скорости минимальны (3-5%). Для Telegram это незаметно — вы получите только плюсы.
                </p>
              </details>

              <details className="group bg-card rounded-xl p-6 border cursor-pointer">
                <summary className="font-semibold text-lg list-none flex items-center justify-between">
                  Работает ли Speed VPN с Telegram Premium?
                  <Icon name="ChevronDown" className="group-open:rotate-180 transition-transform" size={20} />
                </summary>
                <p className="text-muted-foreground mt-4">
                  Да, все функции Telegram Premium работают без ограничений. Быстрая загрузка больших файлов, расширенные стикеры, увеличенные лимиты — всё доступно.
                </p>
              </details>

              <details className="group bg-card rounded-xl p-6 border cursor-pointer">
                <summary className="font-semibold text-lg list-none flex items-center justify-between">
                  Что делать, если VPN не помогает с Telegram?
                  <Icon name="ChevronDown" className="group-open:rotate-180 transition-transform" size={20} />
                </summary>
                <p className="text-muted-foreground mt-4">
                  Напишите в нашу поддержку на speedvpn.io — мы оперативно решим проблему. Обычно достаточно переподключиться к другому серверу или обновить конфигурацию.
                </p>
              </details>
            </div>

            {/* Comparison table */}
            <h2 className="text-2xl md:text-3xl font-bold mb-6 mt-12">
              Speed VPN vs встроенные прокси Telegram
            </h2>

            <div className="overflow-x-auto mb-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-primary/20">
                    <th className="text-left p-4"></th>
                    <th className="text-center p-4 font-bold">Speed VPN</th>
                    <th className="text-center p-4 font-bold text-muted-foreground">Встроенный прокси</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-border">
                    <td className="p-4">Скорость загрузки медиа</td>
                    <td className="p-4 text-center">
                      <Icon name="CheckCircle2" className="text-green-500 mx-auto" size={24} />
                    </td>
                    <td className="p-4 text-center">
                      <Icon name="XCircle" className="text-muted-foreground mx-auto" size={24} />
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4">Стабильность соединения</td>
                    <td className="p-4 text-center">
                      <Icon name="CheckCircle2" className="text-green-500 mx-auto" size={24} />
                    </td>
                    <td className="p-4 text-center">
                      <Icon name="XCircle" className="text-muted-foreground mx-auto" size={24} />
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4">Защита от блокировок</td>
                    <td className="p-4 text-center">
                      <Icon name="CheckCircle2" className="text-green-500 mx-auto" size={24} />
                    </td>
                    <td className="p-4 text-center">
                      <Icon name="XCircle" className="text-muted-foreground mx-auto" size={24} />
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4">Работа на всех устройствах</td>
                    <td className="p-4 text-center">
                      <Icon name="CheckCircle2" className="text-green-500 mx-auto" size={24} />
                    </td>
                    <td className="p-4 text-center">
                      <Icon name="Minus" className="text-muted-foreground mx-auto" size={24} />
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4">Поддержка 24/7</td>
                    <td className="p-4 text-center">
                      <Icon name="CheckCircle2" className="text-green-500 mx-auto" size={24} />
                    </td>
                    <td className="p-4 text-center">
                      <Icon name="XCircle" className="text-muted-foreground mx-auto" size={24} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Final CTA */}
            <div className="mt-12 p-8 bg-gradient-to-br from-primary to-purple-600 rounded-2xl text-white text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Подключите Speed VPN для Telegram прямо сейчас
              </h2>
              <p className="text-lg mb-6 opacity-90">
                От 79₽/месяц. Мгновенная активация. Работает на всех устройствах.
              </p>
              <Link 
                to="/#pricing" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-lg hover:bg-gray-100 transition-all font-bold text-lg"
              >
                Выбрать тариф на speedvpn.io
                <Icon name="ArrowRight" size={24} />
              </Link>
            </div>
          </article>
        </div>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default VpnTelegram;