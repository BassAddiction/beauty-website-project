import { useEffect } from 'react';
import { useSEO } from "@/hooks/useSEO";
import { pageSEO, createWebPageSchema } from "@/utils/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import Icon from '@/components/ui/icon';
import { NewYearTheme } from "@/components/NewYearTheme";
import { Breadcrumbs } from "@/components/Breadcrumbs";

const VpnRussia = () => {
  const pageSchema = createWebPageSchema({
    name: 'VPN для России',
    description: 'Обход блокировок Роскомнадзора',
    url: 'https://speedvpn.io/vpn-russia'
  });

  useSEO({
    ...pageSEO.vpnRussia,
    structuredData: pageSchema
  });
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <NewYearTheme />
      <Header />
      
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <Breadcrumbs items={[{ name: 'VPN для России', path: '/vpn-russia' }]} />

          {/* Hero */}
          <div className="mb-12">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              VPN для России — Speed VPN
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Надёжный VPN-сервис для обхода блокировок в России. Доступ к YouTube, Telegram, ChatGPT и другим заблокированным сервисам. Работает на всех устройствах.
            </p>
          </div>

          {/* Quick CTA */}
          <div className="bg-gradient-to-br from-primary/10 to-purple-600/10 rounded-2xl p-8 mb-12 border border-primary/20">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/20 rounded-xl">
                <Icon name="Globe" className="text-primary" size={32} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3">Интернет без границ от 79₽/неделю</h2>
                <p className="text-muted-foreground mb-4">
                  Speed VPN — специализированный сервис для России. Стабильный обход любых блокировок. Подключается за 2 минуты.
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
              <Icon name="ShieldAlert" className="text-red-500" size={36} />
              Зачем нужен VPN в России
            </h2>
            
            <p className="text-muted-foreground leading-relaxed mb-6">
              С 2022 года в России действуют масштабные блокировки интернет-сервисов. Заблокированы социальные сети, мессенджеры, видеохостинги, ИИ-инструменты. Провайдеры замедляют скорость доступа к международным сайтам. VPN решает все эти проблемы — он изменяет ваше виртуальное местоположение и обходит ограничения.
            </p>

            <div className="bg-card rounded-xl p-6 border mb-8">
              <h3 className="text-xl font-bold mb-4">Что заблокировано в России в 2025 году</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Icon name="Check" className="text-primary flex-shrink-0 mt-1" size={20} />
                  <div>
                    <span className="font-semibold">YouTube</span>
                    <p className="text-sm text-muted-foreground">Полная блокировка с марта 2024</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="Check" className="text-primary flex-shrink-0 mt-1" size={20} />
                  <div>
                    <span className="font-semibold">ChatGPT & ИИ-сервисы</span>
                    <p className="text-sm text-muted-foreground">OpenAI, Claude, Midjourney</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="Check" className="text-primary flex-shrink-0 mt-1" size={20} />
                  <div>
                    <span className="font-semibold">Instagram & Facebook</span>
                    <p className="text-sm text-muted-foreground">Meta признана экстремистской</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="Check" className="text-primary flex-shrink-0 mt-1" size={20} />
                  <div>
                    <span className="font-semibold">Telegram (замедление)</span>
                    <p className="text-sm text-muted-foreground">Медиа загружаются медленно</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="Check" className="text-primary flex-shrink-0 mt-1" size={20} />
                  <div>
                    <span className="font-semibold">Twitter (X)</span>
                    <p className="text-sm text-muted-foreground">Заблокирован с 2022 года</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="Check" className="text-primary flex-shrink-0 mt-1" size={20} />
                  <div>
                    <span className="font-semibold">Discord & LinkedIn</span>
                    <p className="text-sm text-muted-foreground">Недоступны без VPN</p>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-6 mt-12">
              Почему Speed VPN — лучший выбор для России
            </h2>

            <div className="grid gap-6 md:grid-cols-2 my-8">
              <div className="p-6 bg-card rounded-xl border">
                <Icon name="Shield" className="text-primary mb-3" size={32} />
                <h3 className="font-bold text-lg mb-2">Vless Reality — не блокируется</h3>
                <p className="text-muted-foreground text-sm">
                  Используем протокол Vless Reality, который маскирует VPN-трафик под обычный HTTPS. Роскомнадзор не может его обнаружить и заблокировать.
                </p>
              </div>

              <div className="p-6 bg-card rounded-xl border">
                <Icon name="Zap" className="text-primary mb-3" size={32} />
                <h3 className="font-bold text-lg mb-2">Высокая скорость</h3>
                <p className="text-muted-foreground text-sm">
                  Смотрите YouTube в 4K, скачивайте файлы, работайте с ChatGPT без задержек. Наши серверы оптимизированы для российских пользователей.
                </p>
              </div>

              <div className="p-6 bg-card rounded-xl border">
                <Icon name="Wallet" className="text-primary mb-3" size={32} />
                <h3 className="font-bold text-lg mb-2">От 79₽ за 7 дней</h3>
                <p className="text-muted-foreground text-sm">
                  Самые доступные цены на рынке. Дешевле чашки кофе. Месячный тариф — 200₽. Принимаем оплату российскими картами.
                </p>
              </div>

              <div className="p-6 bg-card rounded-xl border">
                <Icon name="Infinity" className="text-primary mb-3" size={32} />
                <h3 className="font-bold text-lg mb-2">Все устройства в одной подписке</h3>
                <p className="text-muted-foreground text-sm">
                  Подключите телефон, компьютер, планшет, Smart TV — без ограничений. Одна подписка speedvpn.io на всю семью.
                </p>
              </div>

              <div className="p-6 bg-card rounded-xl border">
                <Icon name="Database" className="text-primary mb-3" size={32} />
                <h3 className="font-bold text-lg mb-2">30 ГБ трафика в сутки</h3>
                <p className="text-muted-foreground text-sm">
                  Щедрый лимит трафика — хватит на 6 часов HD-видео или 15 часов обычного качества. Для большинства это избыток.
                </p>
              </div>

              <div className="p-6 bg-card rounded-xl border">
                <Icon name="Clock" className="text-primary mb-3" size={32} />
                <h3 className="font-bold text-lg mb-2">Мгновенная активация</h3>
                <p className="text-muted-foreground text-sm">
                  Оплатили — сразу получили доступ. Никакого ожидания модерации или проверок. Всё автоматизировано.
                </p>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-6 mt-12">
              Как подключить VPN для России
            </h2>

            <div className="space-y-6">
              <div className="bg-card rounded-xl p-6 border">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Выберите тариф на speedvpn.io</h3>
                    <p className="text-muted-foreground">
                      Перейдите на <Link to="/#pricing" className="text-primary hover:underline">страницу тарифов</Link> и выберите подходящий план. Рекомендуем начать с базового за 79₽ — можно продлить позже.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 border">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Оплатите российской картой</h3>
                    <p className="text-muted-foreground">
                      Принимаем карты МИР, Visa, Mastercard российских банков. После оплаты моментально получите ссылку на конфигурацию VPN.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 border">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Установите приложение</h3>
                    <p className="text-muted-foreground mb-3">
                      Скачайте бесплатный VPN-клиент для вашего устройства:
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                      <li>iOS / Android: приложение Hiddify (App Store / Google Play)</li>
                      <li>Windows / Mac: программа v2rayN (ссылка в письме)</li>
                      <li>Linux: клиент v2ray через терминал</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 border">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Подключитесь и пользуйтесь</h3>
                    <p className="text-muted-foreground">
                      Импортируйте конфигурацию из письма (кнопка импорта или QR-код), нажмите «Подключить». Готово — все сайты теперь доступны!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 border-l-4 border-primary rounded-r-xl p-6 my-12">
              <div className="flex items-start gap-3">
                <Icon name="Video" className="text-primary flex-shrink-0 mt-1" size={24} />
                <div>
                  <p className="font-semibold mb-2">Подробная видеоинструкция</p>
                  <p className="text-muted-foreground">
                    На <Link to="/#training" className="text-primary hover:underline">главной странице</Link> есть видео по настройке для всех платформ. Если возникнут вопросы — напишите в поддержку.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-6 mt-12">
              Speed VPN vs другие VPN для России
            </h2>

            <div className="overflow-x-auto mb-8">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-primary/20">
                    <th className="text-left p-4 font-bold">Критерий</th>
                    <th className="text-center p-4 font-bold">Speed VPN</th>
                    <th className="text-center p-4 font-bold text-muted-foreground">Бесплатные VPN</th>
                    <th className="text-center p-4 font-bold text-muted-foreground">Зарубежные VPN</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="p-4">Работает в России</td>
                    <td className="p-4 text-center">
                      <Icon name="CheckCircle2" className="text-green-500 mx-auto" size={24} />
                    </td>
                    <td className="p-4 text-center">
                      <Icon name="XCircle" className="text-muted-foreground mx-auto" size={24} />
                    </td>
                    <td className="p-4 text-center">
                      <Icon name="Minus" className="text-muted-foreground mx-auto" size={24} />
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4">Не блокируется РКН</td>
                    <td className="p-4 text-center">
                      <Icon name="CheckCircle2" className="text-green-500 mx-auto" size={24} />
                    </td>
                    <td className="p-4 text-center">
                      <Icon name="XCircle" className="text-muted-foreground mx-auto" size={24} />
                    </td>
                    <td className="p-4 text-center">
                      <Icon name="XCircle" className="text-muted-foreground mx-auto" size={24} />
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4">Высокая скорость</td>
                    <td className="p-4 text-center">
                      <Icon name="CheckCircle2" className="text-green-500 mx-auto" size={24} />
                    </td>
                    <td className="p-4 text-center">
                      <Icon name="XCircle" className="text-muted-foreground mx-auto" size={24} />
                    </td>
                    <td className="p-4 text-center">
                      <Icon name="Minus" className="text-muted-foreground mx-auto" size={24} />
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4">Оплата рос. картами</td>
                    <td className="p-4 text-center">
                      <Icon name="CheckCircle2" className="text-green-500 mx-auto" size={24} />
                    </td>
                    <td className="p-4 text-center text-muted-foreground">—</td>
                    <td className="p-4 text-center">
                      <Icon name="XCircle" className="text-muted-foreground mx-auto" size={24} />
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4">Без логов</td>
                    <td className="p-4 text-center">
                      <Icon name="CheckCircle2" className="text-green-500 mx-auto" size={24} />
                    </td>
                    <td className="p-4 text-center">
                      <Icon name="XCircle" className="text-muted-foreground mx-auto" size={24} />
                    </td>
                    <td className="p-4 text-center">
                      <Icon name="CheckCircle2" className="text-green-500 mx-auto" size={24} />
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4">Цена</td>
                    <td className="p-4 text-center font-semibold text-primary">от 79₽</td>
                    <td className="p-4 text-center text-muted-foreground">Бесплатно</td>
                    <td className="p-4 text-center text-muted-foreground">от $10</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-6 mt-12">
              Часто задаваемые вопросы про VPN в России
            </h2>

            <div className="space-y-4">
              <details className="group bg-card rounded-xl p-6 border cursor-pointer">
                <summary className="font-semibold text-lg list-none flex items-center justify-between">
                  Легально ли использовать VPN в России?
                  <Icon name="ChevronDown" className="group-open:rotate-180 transition-transform" size={20} />
                </summary>
                <p className="text-muted-foreground mt-4">
                  Да, использование VPN в России законно для физических лиц. Запрет распространяется только на VPN-сервисы, которые не блокируют запрещённые сайты по требованию РКН. Speed VPN работает легально.
                </p>
              </details>

              <details className="group bg-card rounded-xl p-6 border cursor-pointer">
                <summary className="font-semibold text-lg list-none flex items-center justify-between">
                  Заблокирует ли провайдер Speed VPN?
                  <Icon name="ChevronDown" className="group-open:rotate-180 transition-transform" size={20} />
                </summary>
                <p className="text-muted-foreground mt-4">
                  Нет. Мы используем протокол Vless Reality, который маскирует VPN под обычный HTTPS-трафик. Провайдер и РКН не могут определить, что вы используете VPN.
                </p>
              </details>

              <details className="group bg-card rounded-xl p-6 border cursor-pointer">
                <summary className="font-semibold text-lg list-none flex items-center justify-between">
                  Какой тариф выбрать для России?
                  <Icon name="ChevronDown" className="group-open:rotate-180 transition-transform" size={20} />
                </summary>
                <p className="text-muted-foreground mt-4">
                  Базового тарифа за 79₽ достаточно для большинства задач. Если планируете смотреть много видео в 4K или работать всей семьёй — выберите тариф с большим лимитом.
                </p>
              </details>

              <details className="group bg-card rounded-xl p-6 border cursor-pointer">
                <summary className="font-semibold text-lg list-none flex items-center justify-between">
                  Работает ли Speed VPN на всех устройствах?
                  <Icon name="ChevronDown" className="group-open:rotate-180 transition-transform" size={20} />
                </summary>
                <p className="text-muted-foreground mt-4">
                  Да! Speed VPN работает на iOS, Android, Windows, macOS, Linux. Можно даже настроить на роутере — тогда весь домашний интернет пойдёт через VPN.
                </p>
              </details>

              <details className="group bg-card rounded-xl p-6 border cursor-pointer">
                <summary className="font-semibold text-lg list-none flex items-center justify-between">
                  Как быстро активируется подписка?
                  <Icon name="ChevronDown" className="group-open:rotate-180 transition-transform" size={20} />
                </summary>
                <p className="text-muted-foreground mt-4">
                  Мгновенно! После оплаты вы сразу получите ссылку на конфигурацию на email. Весь процесс автоматизирован — никакого ожидания.
                </p>
              </details>

              <details className="group bg-card rounded-xl p-6 border cursor-pointer">
                <summary className="font-semibold text-lg list-none flex items-center justify-between">
                  Что делать, если VPN перестал работать?
                  <Icon name="ChevronDown" className="group-open:rotate-180 transition-transform" size={20} />
                </summary>
                <p className="text-muted-foreground mt-4">
                  Напишите в нашу поддержку на speedvpn.io — мы оперативно решим проблему. Обычно помогает обновление конфигурации или переподключение.
                </p>
              </details>
            </div>

            {/* Statistics */}
            <h2 className="text-2xl md:text-3xl font-bold mb-6 mt-12">
              Speed VPN в цифрах
            </h2>

            <div className="grid gap-6 md:grid-cols-3 my-8">
              <div className="text-center p-6 bg-card rounded-xl border">
                <div className="text-4xl font-bold text-primary mb-2">15,000+</div>
                <p className="text-muted-foreground">Пользователей из России</p>
              </div>
              <div className="text-center p-6 bg-card rounded-xl border">
                <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
                <p className="text-muted-foreground">Время работы серверов</p>
              </div>
              <div className="text-center p-6 bg-card rounded-xl border">
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <p className="text-muted-foreground">Поддержка пользователей</p>
              </div>
            </div>

            {/* Final CTA */}
            <div className="mt-12 p-8 bg-gradient-to-br from-primary to-purple-600 rounded-2xl text-white text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Подключите Speed VPN для России прямо сейчас
              </h2>
              <p className="text-lg mb-6 opacity-90">
                От 79₽/месяц. Обход любых блокировок. Работает на всех устройствах.
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

export default VpnRussia;