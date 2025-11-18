import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from "@/hooks/useSEO";
import { pageSEO, createProductSchema, addStructuredData } from "@/utils/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import Icon from '@/components/ui/icon';
import { NewYearTheme } from "@/components/NewYearTheme";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { buyVpnFAQ } from "@/utils/faqSchemas";

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
    addStructuredData(buyVpnFAQ);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <NewYearTheme />
      <Header />
      
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <Breadcrumbs items={[{ name: 'Купить VPN', path: '/buy-vpn' }]} />

          <div className="mb-12">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Купить VPN для России — Speed VPN
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Надёжный VPN от 79 рублей за 7 дней. Оплата российскими картами. Мгновенная активация. Обход всех блокировок. Работает на любых устройствах.
            </p>
          </div>

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
          </article>
        </div>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default BuyVpn;
