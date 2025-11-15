import { useEffect } from 'react';
import { useSEO } from "@/hooks/useSEO";
import { pageSEO, createProductSchema } from "@/utils/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import Icon from '@/components/ui/icon';
import { NewYearTheme } from "@/components/NewYearTheme";
import { Breadcrumbs } from "@/components/Breadcrumbs";

const BuyVpn = () => {
  const productSchema = createProductSchema({
    name: 'Speed VPN — VPN для России',
    description: 'Быстрый и безопасный VPN-сервис с Vless Reality протоколом',
    price: '79',
    priceCurrency: 'RUB'
  });

  useSEO({
    ...pageSEO.buyVpn,
    structuredData: productSchema
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
          <Breadcrumbs items={[{ name: 'Купить VPN', path: '/buy-vpn' }]} />

          {/* Hero */}
          <div className="mb-12">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Купить VPN для России — Speed VPN
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Надёжный VPN от 79 рублей за 7 дней. Оплата российскими картами. Мгновенная активация. Обход всех блокировок. Работает на любых устройствах.
            </p>
          </div>

          {/* Quick Pricing Cards */}
          <div className="grid gap-6 md:grid-cols-3 mb-12">
            <div className="bg-card rounded-xl p-6 border hover:border-primary transition-all">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-primary mb-2">79₽</div>
                <p className="text-muted-foreground text-sm">7 дней</p>
              </div>
              <ul className="space-y-2 text-sm mb-6">
                <li className="flex items-center gap-2">
                  <Icon name="Check" className="text-primary" size={16} />
                  <span>30 ГБ/день</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" className="text-primary" size={16} />
                  <span>Все устройства</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" className="text-primary" size={16} />
                  <span>Базовая поддержка</span>
                </li>
              </ul>
              <Link 
                to="/#pricing"
                className="block w-full text-center px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all font-semibold"
              >
                Выбрать
              </Link>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-purple-600/10 rounded-xl p-6 border-2 border-primary relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold">
                ПОПУЛЯРНЫЙ
              </div>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-primary mb-2">900₽</div>
                <p className="text-muted-foreground text-sm">6 месяцев</p>
                <p className="text-xs text-primary font-semibold">150₽/месяц • скидка 25%</p>
              </div>
              <ul className="space-y-2 text-sm mb-6">
                <li className="flex items-center gap-2">
                  <Icon name="Check" className="text-primary" size={16} />
                  <span>30 ГБ/день</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" className="text-primary" size={16} />
                  <span>Все устройства</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" className="text-primary" size={16} />
                  <span>Приоритет поддержки</span>
                </li>
              </ul>
              <Link 
                to="/#pricing"
                className="block w-full text-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-semibold"
              >
                Выбрать
              </Link>
            </div>

            <div className="bg-card rounded-xl p-6 border hover:border-primary transition-all">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-primary mb-2">1200₽</div>
                <p className="text-muted-foreground text-sm">12 месяцев</p>
                <p className="text-xs text-primary font-semibold">100₽/месяц • скидка 50%</p>
              </div>
              <ul className="space-y-2 text-sm mb-6">
                <li className="flex items-center gap-2">
                  <Icon name="Check" className="text-primary" size={16} />
                  <span>30 ГБ/день</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" className="text-primary" size={16} />
                  <span>Все устройства</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" className="text-primary" size={16} />
                  <span>Максимальная выгода</span>
                </li>
              </ul>
              <Link 
                to="/#pricing"
                className="block w-full text-center px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all font-semibold"
              >
                Выбрать
              </Link>
            </div>
          </div>

          {/* Main Content */}
          <article className="prose prose-lg max-w-none">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
              <Icon name="ShoppingCart" className="text-primary" size={36} />
              Почему стоит купить Speed VPN
            </h2>
            
            <p className="text-muted-foreground leading-relaxed mb-8">
              Speed VPN — это надёжный сервис для обхода блокировок в России. Мы специализируемся на российском рынке с 2022 года и знаем все особенности работы с местными провайдерами и блокировками РКН.
            </p>

            <div className="grid gap-6 md:grid-cols-2 my-8">
              <div className="p-6 bg-card rounded-xl border">
                <Icon name="CreditCard" className="text-primary mb-3" size={32} />
                <h3 className="font-bold text-lg mb-2">Оплата российскими картами</h3>
                <p className="text-muted-foreground text-sm">
                  Принимаем карты МИР, Visa, Mastercard российских банков. Не нужна криптовалюта или зарубежные платёжные системы.
                </p>
              </div>

              <div className="p-6 bg-card rounded-xl border">
                <Icon name="Zap" className="text-primary mb-3" size={32} />
                <h3 className="font-bold text-lg mb-2">Мгновенная активация</h3>
                <p className="text-muted-foreground text-sm">
                  Оплатили — сразу получили доступ. Конфигурация VPN приходит на email автоматически. Начинайте пользоваться через 2 минуты.
                </p>
              </div>

              <div className="p-6 bg-card rounded-xl border">
                <Icon name="Shield" className="text-primary mb-3" size={32} />
                <h3 className="font-bold text-lg mb-2">Не блокируется в России</h3>
                <p className="text-muted-foreground text-sm">
                  Используем протокол Vless Reality — РКН не может его обнаружить. Работаем стабильно даже когда другие VPN падают.
                </p>
              </div>

              <div className="p-6 bg-card rounded-xl border">
                <Icon name="Infinity" className="text-primary mb-3" size={32} />
                <h3 className="font-bold text-lg mb-2">Все устройства включены</h3>
                <p className="text-muted-foreground text-sm">
                  Купите один раз — используйте на телефоне, компьютере, планшете, Smart TV одновременно. Без доплат за дополнительные устройства.
                </p>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-6 mt-12">
              Что входит в покупку VPN
            </h2>

            <div className="bg-card rounded-xl p-6 border mb-8">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Icon name="Check" className="text-primary flex-shrink-0 mt-1" size={20} />
                  <div>
                    <span className="font-semibold">Доступ ко всем заблокированным сайтам</span>
                    <p className="text-sm text-muted-foreground">YouTube, ChatGPT, Instagram, Facebook, Twitter, Discord, LinkedIn и другие</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="Check" className="text-primary flex-shrink-0 mt-1" size={20} />
                  <div>
                    <span className="font-semibold">Конфигурация для всех платформ</span>
                    <p className="text-sm text-muted-foreground">Одна покупка работает на iOS, Android, Windows, macOS, Linux</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="Check" className="text-primary flex-shrink-0 mt-1" size={20} />
                  <div>
                    <span className="font-semibold">30 ГБ трафика в сутки</span>
                    <p className="text-sm text-muted-foreground">Хватит на 6 часов HD-видео или 15 часов в стандартном качестве</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="Check" className="text-primary flex-shrink-0 mt-1" size={20} />
                  <div>
                    <span className="font-semibold">Инструкция по настройке</span>
                    <p className="text-sm text-muted-foreground">Пошаговое видео и текстовые гайды для каждой платформы</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="Check" className="text-primary flex-shrink-0 mt-1" size={20} />
                  <div>
                    <span className="font-semibold">Техническая поддержка</span>
                    <p className="text-sm text-muted-foreground">Помощь в настройке и решении проблем через Telegram</p>
                  </div>
                </li>
              </ul>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-6 mt-12">
              Как купить VPN — пошаговая инструкция
            </h2>

            <div className="space-y-6">
              <div className="bg-card rounded-xl p-6 border">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Выберите тариф</h3>
                    <p className="text-muted-foreground">
                      Перейдите на <Link to="/#pricing" className="text-primary hover:underline">страницу с тарифами speedvpn.io</Link>. Рекомендуем полугодовой — оптимальное соотношение цены и срока.
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
                    <h3 className="text-xl font-bold mb-2">Укажите email</h3>
                    <p className="text-muted-foreground">
                      Введите действующий email — на него придёт конфигурация VPN. Используйте почту, к которой у вас есть доступ.
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
                    <h3 className="text-xl font-bold mb-2">Оплатите картой</h3>
                    <p className="text-muted-foreground">
                      Принимаем карты МИР, Visa, Mastercard российских банков. Платёж проходит через защищённый шлюз — ваши данные в безопасности.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 border">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Получите доступ</h3>
                    <p className="text-muted-foreground">
                      Сразу после оплаты на email придёт письмо с QR-кодом и ссылкой на конфигурацию. Импортируйте в приложение — готово!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-500/10 border-l-4 border-green-500 rounded-r-xl p-6 my-12">
              <div className="flex items-start gap-3">
                <Icon name="Gift" className="text-green-500 flex-shrink-0 mt-1" size={24} />
                <div>
                  <p className="font-semibold mb-2">Скидка на длинные подписки</p>
                  <p className="text-muted-foreground">
                    При покупке на 6 месяцев экономия 25%, на год — 50%. Чем дольше срок, тем выгоднее цена за месяц.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-6 mt-12">
              Способы оплаты VPN
            </h2>

            <div className="grid gap-6 md:grid-cols-2 my-8">
              <div className="p-6 bg-card rounded-xl border">
                <div className="flex items-center gap-3 mb-3">
                  <Icon name="CreditCard" className="text-primary" size={28} />
                  <h3 className="font-bold text-lg">Банковские карты</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-3">
                  МИР, Visa, Mastercard российских банков: Сбер, Тинькофф, Альфа-Банк, ВТБ и другие.
                </p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded text-xs font-semibold">Мгновенно</span>
                  <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded text-xs font-semibold">Популярно</span>
                </div>
              </div>

              <div className="p-6 bg-card rounded-xl border">
                <div className="flex items-center gap-3 mb-3">
                  <Icon name="Smartphone" className="text-primary" size={28} />
                  <h3 className="font-bold text-lg">СБП (Система Быстрых Платежей)</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-3">
                  Оплата по номеру телефона через приложение банка. Без комиссии.
                </p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded text-xs font-semibold">Мгновенно</span>
                </div>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-6 mt-12">
              Частые вопросы про покупку VPN
            </h2>

            <div className="space-y-4">
              <details className="group bg-card rounded-xl p-6 border cursor-pointer">
                <summary className="font-semibold text-lg list-none flex items-center justify-between">
                  Безопасно ли покупать VPN онлайн?
                  <Icon name="ChevronDown" className="group-open:rotate-180 transition-transform" size={20} />
                </summary>
                <p className="text-muted-foreground mt-4">
                  Да, абсолютно безопасно. Мы используем защищённые платёжные шлюзы — данные вашей карты передаются в зашифрованном виде. Speed VPN работает с 2022 года, более 15,000 пользователей.
                </p>
              </details>

              <details className="group bg-card rounded-xl p-6 border cursor-pointer">
                <summary className="font-semibold text-lg list-none flex items-center justify-between">
                  Можно ли вернуть деньги, если VPN не подошёл?
                  <Icon name="ChevronDown" className="group-open:rotate-180 transition-transform" size={20} />
                </summary>
                <p className="text-muted-foreground mt-4">
                  Да, мы возвращаем деньги в течение 3 дней после покупки, если VPN не заработал. Напишите в поддержку — вернём без вопросов.
                </p>
              </details>

              <details className="group bg-card rounded-xl p-6 border cursor-pointer">
                <summary className="font-semibold text-lg list-none flex items-center justify-between">
                  Что будет в выписке по карте?
                  <Icon name="ChevronDown" className="group-open:rotate-180 transition-transform" size={20} />
                </summary>
                <p className="text-muted-foreground mt-4">
                  В выписке появится платёж с нейтральным описанием "интернет-услуги" или "подписка". Никаких упоминаний VPN.
                </p>
              </details>

              <details className="group bg-card rounded-xl p-6 border cursor-pointer">
                <summary className="font-semibold text-lg list-none flex items-center justify-between">
                  Автоматически ли продлевается подписка?
                  <Icon name="ChevronDown" className="group-open:rotate-180 transition-transform" size={20} />
                </summary>
                <p className="text-muted-foreground mt-4">
                  Нет, подписка НЕ продлевается автоматически. Вы платите один раз за выбранный период. Хотите продлить — купите новую подписку вручную.
                </p>
              </details>

              <details className="group bg-card rounded-xl p-6 border cursor-pointer">
                <summary className="font-semibold text-lg list-none flex items-center justify-between">
                  Какой тариф выгоднее купить?
                  <Icon name="ChevronDown" className="group-open:rotate-180 transition-transform" size={20} />
                </summary>
                <p className="text-muted-foreground mt-4">
                  Самый выгодный — годовой (1200₽ за год, 100₽/месяц, скидка 50%). Но если пробуете впервые — возьмите неделю за 79₽, оцените качество, потом купите длинную подписку.
                </p>
              </details>

              <details className="group bg-card rounded-xl p-6 border cursor-pointer">
                <summary className="font-semibold text-lg list-none flex items-center justify-between">
                  Можно ли купить VPN в подарок?
                  <Icon name="ChevronDown" className="group-open:rotate-180 transition-transform" size={20} />
                </summary>
                <p className="text-muted-foreground mt-4">
                  Да! При покупке укажите email получателя — ему придёт конфигурация. Хороший подарок для друзей, родителей, коллег из России.
                </p>
              </details>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-6 mt-12">
              Почему клиенты выбирают Speed VPN
            </h2>

            <div className="grid gap-6 md:grid-cols-3 my-8">
              <div className="p-6 bg-card rounded-xl border text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="TrendingUp" className="text-primary" size={32} />
                </div>
                <h3 className="font-bold mb-2">Высокая скорость</h3>
                <p className="text-sm text-muted-foreground">4K-видео без буферизации, быстрые загрузки</p>
              </div>

              <div className="p-6 bg-card rounded-xl border text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="ShieldCheck" className="text-primary" size={32} />
                </div>
                <h3 className="font-bold mb-2">Не блокируется</h3>
                <p className="text-sm text-muted-foreground">Vless Reality обходит DPI-блокировки</p>
              </div>

              <div className="p-6 bg-card rounded-xl border text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="HeadphonesIcon" className="text-primary" size={32} />
                </div>
                <h3 className="font-bold mb-2">Поддержка 24/7</h3>
                <p className="text-sm text-muted-foreground">Быстрые ответы в Telegram-поддержке</p>
              </div>
            </div>

            {/* Final CTA */}
            <div className="mt-12 p-8 bg-gradient-to-br from-primary to-purple-600 rounded-2xl text-white text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Купить Speed VPN прямо сейчас
              </h2>
              <p className="text-lg mb-6 opacity-90">
                От 79₽ за 7 дней. Оплата российскими картами. Мгновенная активация.
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

export default BuyVpn;