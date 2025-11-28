import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from "@/hooks/useSEO";
import { pageSEO, createWebPageSchema, addStructuredData } from "@/utils/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import Icon from '@/components/ui/icon';
import { NewYearTheme } from "@/components/NewYearTheme";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQBlock } from "@/components/FAQBlock";
import { vpnYoutubeFAQ } from "@/utils/faqSchemas";

const VpnYoutube = () => {
  const pageSchema = createWebPageSchema({
    name: 'VPN для YouTube',
    description: 'Быстрый доступ к YouTube без ограничений',
    url: 'https://speedvpn.io/vpn-youtube'
  });

  useSEO({
    ...pageSEO.vpnYoutube,
    structuredData: pageSchema
  });
  
  useEffect(() => {
    window.scrollTo(0, 0);
    addStructuredData(vpnYoutubeFAQ);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <NewYearTheme />
      <Header />
      
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <Breadcrumbs items={[{ name: 'VPN для YouTube', path: '/vpn-youtube' }]} />

          {/* Hero */}
          <div className="mb-12">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Как подключить VPN для YouTube в России
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              YouTube заблокирован в России с марта 2024 года. Рассказываем, как быстро подключить надёжный VPN и смотреть видео без тормозов на любом устройстве.
            </p>
          </div>

          {/* Quick CTA */}
          <div className="bg-gradient-to-br from-primary/10 to-purple-600/10 rounded-2xl p-8 mb-12 border border-primary/20">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/20 rounded-xl">
                <Icon name="Zap" className="text-primary" size={32} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3">Быстрый старт — 3 минуты</h2>
                <p className="text-muted-foreground mb-4">
                  Speed VPN работает сразу после оплаты. Не нужно настраивать, разбираться в технологиях — просто нажмите кнопку и смотрите YouTube.
                </p>
                <Link 
                  to="/#pricing" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-semibold"
                >
                  Подключить VPN от 79₽/неделя
                  <Icon name="ArrowRight" size={20} />
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <article className="prose prose-lg max-w-none">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
              <Icon name="Youtube" className="text-red-500" size={36} />
              Почему YouTube не работает без VPN
            </h2>
            
            <p className="text-muted-foreground leading-relaxed mb-6">
              С весны 2024 года YouTube недоступен на территории России без использования VPN. Блокировка затронула как веб-версию, так и мобильные приложения. Обычные способы обхода (прокси, смена DNS) не помогают — нужен полноценный VPN.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold mb-6 mt-12">
              Как подключить VPN для YouTube — пошаговая инструкция
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
                      Переходите на <Link to="/#pricing" className="text-primary hover:underline">страницу с тарифами</Link> и выбирайте подходящий план. Рекомендуем начать с тарифа на 7 дней за 79₽ — этого достаточно для комфортного просмотра YouTube.
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>30 ГБ трафика в день — хватит на 6 часов HD-видео</li>
                      <li>Безлимитное количество устройств</li>
                      <li>Работает на всех платформах</li>
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
                    <h3 className="text-xl font-bold mb-3">Оплатите и получите конфигурацию</h3>
                    <p className="text-muted-foreground mb-3">
                      После оплаты вы мгновенно получите ссылку на конфигурацию VPN на указанную почту. Никакого ожидания — всё работает автоматически.
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
                    <h3 className="text-xl font-bold mb-3">Установите приложение v2rayN или Hiddify</h3>
                    <p className="text-muted-foreground mb-4">
                      Это клиенты для подключения к VPN. Они бесплатные и простые в использовании:
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="p-4 bg-background/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name="Smartphone" className="text-primary" size={20} />
                          <span className="font-semibold">iOS / Android</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Скачайте Hiddify из App Store или Google Play</p>
                      </div>
                      <div className="p-4 bg-background/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name="Monitor" className="text-primary" size={20} />
                          <span className="font-semibold">Windows / Mac</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Установите v2rayN с официального сайта</p>
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
                    <h3 className="text-xl font-bold mb-3">Импортируйте конфигурацию и подключитесь</h3>
                    <p className="text-muted-foreground mb-3">
                      Откройте приложение, нажмите «Импорт» или отсканируйте QR-код из письма. Нажмите «Подключить» — всё готово! Теперь можете заходить на YouTube.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 border-l-4 border-primary rounded-r-xl p-6 my-12">
              <div className="flex items-start gap-3">
                <Icon name="Info" className="text-primary flex-shrink-0 mt-1" size={24} />
                <div>
                  <p className="font-semibold mb-2">Полная видеоинструкция</p>
                  <p className="text-muted-foreground">
                    Подробный видеогайд по установке на всех платформах есть на <Link to="/#training" className="text-primary hover:underline">главной странице</Link> в разделе «Обучение».
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-6 mt-12">
              Почему Speed VPN лучше бесплатных VPN для YouTube
            </h2>

            <div className="grid gap-6 md:grid-cols-2 my-8">
              <div className="p-6 bg-card rounded-xl border">
                <Icon name="Gauge" className="text-primary mb-3" size={32} />
                <h3 className="font-bold text-lg mb-2">Высокая скорость</h3>
                <p className="text-muted-foreground text-sm">
                  Бесплатные VPN режут скорость в 5-10 раз. Speed VPN работает на Vless Reality — смотрите 4K без буферизации.
                </p>
              </div>

              <div className="p-6 bg-card rounded-xl border">
                <Icon name="Shield" className="text-primary mb-3" size={32} />
                <h3 className="font-bold text-lg mb-2">Без логов и продажи данных</h3>
                <p className="text-muted-foreground text-sm">
                  Бесплатные сервисы зарабатывают на продаже ваших данных. Мы работаем по подписке и не храним логи.
                </p>
              </div>

              <div className="p-6 bg-card rounded-xl border">
                <Icon name="Infinity" className="text-primary mb-3" size={32} />
                <h3 className="font-bold text-lg mb-2">Неограниченные устройства</h3>
                <p className="text-muted-foreground text-sm">
                  Подключите телефон, планшет, компьютер, Smart TV — одна подписка на все гаджеты семьи.
                </p>
              </div>

              <div className="p-6 bg-card rounded-xl border">
                <Icon name="Clock" className="text-primary mb-3" size={32} />
                <h3 className="font-bold text-lg mb-2">Стабильность 24/7</h3>
                <p className="text-muted-foreground text-sm">
                  Бесплатные VPN часто падают или блокируются. Наши серверы работают без сбоев круглосуточно.
                </p>
              </div>
            </div>
          </article>
        </div>
      </main>

      <FAQBlock 
        faqs={vpnYoutubeFAQ.mainEntity.map((item: any) => ({
          question: item.name,
          answer: item.acceptedAnswer.text
        }))}
      />

      <div className="container mx-auto px-4 max-w-4xl">
        <div className="py-12">
          {/* Final CTA */}
          <div className="p-8 bg-gradient-to-br from-primary to-purple-600 rounded-2xl text-white text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Подключите VPN и смотрите YouTube прямо сейчас
              </h2>
              <p className="text-lg mb-6 opacity-90">
                Тарифы от 79 рублей. Мгновенная активация. Работает на всех устройствах.
              </p>
              <Link 
                to="/#pricing" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-lg hover:bg-gray-100 transition-all font-bold text-lg"
              >
                Выбрать тариф
                <Icon name="ArrowRight" size={24} />
              </Link>
            </div>
          </div>
        </div>

      <Footer />
      <ScrollToTop />
    </div>
    </>
  );
};

export default VpnYoutube;