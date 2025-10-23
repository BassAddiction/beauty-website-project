import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Icon from "@/components/ui/icon";

const Index = () => {
  const plans = [
    {
      name: "1 Месяц",
      price: "200",
      period: "₽",
      popular: true,
      features: [
        "Безлимитный трафик",
        "5 устройств",
        "Стандартная скорость",
        "Базовая поддержка"
      ]
    },
    {
      name: "3 Месяца",
      price: "550",
      period: "₽",
      features: [
        "Безлимитный трафик",
        "10 устройств",
        "Максимальная скорость",
        "Приоритетная поддержка 24/7"
      ]
    },
    {
      name: "6 Месяцев",
      price: "1000",
      period: "₽",
      features: [
        "Безлимитный трафик",
        "Без ограничений устройств",
        "Максимальная скорость",
        "Приоритетная поддержка 24/7"
      ]
    },
    {
      name: "12 Месяцев",
      price: "1500",
      period: "₽",
      features: [
        "Безлимитный трафик",
        "Без ограничений устройств",
        "Максимальная скорость",
        "VIP поддержка 24/7"
      ]
    }
  ];

  const faqs = [
    {
      question: "Что такое VPN и зачем он нужен?",
      answer: "VPN (Virtual Private Network) — это защищённое соединение, которое шифрует ваш интернет-трафик и скрывает ваш IP-адрес. Это обеспечивает конфиденциальность, безопасность и доступ к контенту без географических ограничений."
    },
    {
      question: "На скольких устройствах я могу использовать VPN?",
      answer: "Количество устройств зависит от выбранного тарифа. Базовый план поддерживает до 5 устройств, Про — до 10, а Премиум — неограниченное количество устройств одновременно."
    },
    {
      question: "Влияет ли VPN на скорость интернета?",
      answer: "Наш VPN оптимизирован для максимальной скорости. На тарифах Про и Премиум вы получаете приоритетный доступ к серверам, что обеспечивает минимальное влияние на скорость соединения."
    },
    {
      question: "Какие способы оплаты вы принимаете?",
      answer: "Мы принимаем все основные банковские карты, электронные кошельки и криптовалюту. Оплата полностью безопасна и защищена."
    },
    {
      question: "Могу ли я отменить подписку?",
      answer: "Да, вы можете отменить подписку в любой момент. При этом доступ к сервису сохранится до конца оплаченного периода."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="https://cdn.poehali.dev/files/3a0045b1-8f62-461c-946f-ea67286d8040.png" alt="Speed VPN" className="w-8 h-8 rounded-lg hover:scale-110 transition-transform duration-300" />
            <span className="text-xl font-bold">SPEED VPN</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Возможности</a>
            <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Тарифы</a>
            <a href="#training" className="text-sm font-medium hover:text-primary transition-colors">Обучение</a>
            <a href="#faq" className="text-sm font-medium hover:text-primary transition-colors">FAQ</a>
          </nav>
          <Button className="rounded-full button-glow" asChild>
            <a href="https://t.me/shopspeedvpn_bot" target="_blank" rel="noopener noreferrer">
              Начать
            </a>
          </Button>
        </div>
      </header>

      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
              Быстрый и безопасный<br />
              <span className="text-primary">VPN-сервис</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Защитите свою конфиденциальность в интернете. Высокая скорость, надёжное шифрование и доступ к любому контенту
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="rounded-full text-lg px-8 h-14 button-glow" asChild>
                <a href="https://t.me/shopspeedvpn_bot" target="_blank" rel="noopener noreferrer">
                  Попробовать бесплатно
                </a>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full text-lg px-8 h-14" asChild>
                <a href="https://t.me/gospeedvpn" target="_blank" rel="noopener noreferrer">
                  Support
                </a>
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-20" id="features">
            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon name="Shield" size={24} className="text-primary" />
                </div>
                <CardTitle>Безопасность</CardTitle>
                <CardDescription>
                  Vless - Reality протокол с усиленной защитой обеспечивает максимальную конфиденциальность и обход любых блокировок
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon name="Zap" size={24} className="text-primary" />
                </div>
                <CardTitle>Скорость</CardTitle>
                <CardDescription>
                  Высокоскоростные серверы в 50+ странах обеспечивают мгновенный доступ
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon name="Globe" size={24} className="text-primary" />
                </div>
                <CardTitle>Глобальный доступ</CardTitle>
                <CardDescription>
                  Разблокируйте любой контент и сервисы без географических ограничений
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-muted/30" id="pricing">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Выберите свой тариф</h2>
            <p className="text-xl text-muted-foreground">
              Гибкие планы для любых потребностей
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-2 border-primary shadow-xl scale-105' : 'border-2'} hover:shadow-lg transition-all duration-300`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black px-4 py-1 rounded-full text-sm font-semibold">
                    Популярный
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-5xl font-black">{plan.price}₽</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Icon name="Check" size={20} className="text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full rounded-full button-glow ${plan.popular ? '' : 'variant-outline'}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    asChild
                  >
                    <a href="https://t.me/shopspeedvpn_bot" target="_blank" rel="noopener noreferrer">
                      Подключить
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Нам доверяют тысячи пользователей</h2>
            <p className="text-xl text-muted-foreground">
              Реальная статистика нашего сервиса
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="border-2 text-center p-8 hover:border-primary transition-all">
              <div className="text-5xl font-black text-primary mb-2">10,000+</div>
              <div className="text-lg text-muted-foreground">Активных пользователей</div>
            </Card>
            <Card className="border-2 text-center p-8 hover:border-primary transition-all">
              <div className="text-5xl font-black text-primary mb-2">50+</div>
              <div className="text-lg text-muted-foreground">Серверов по всему миру</div>
            </Card>
            <Card className="border-2 text-center p-8 hover:border-primary transition-all">
              <div className="text-5xl font-black text-primary mb-2">99.9%</div>
              <div className="text-lg text-muted-foreground">Время работы сервиса</div>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 p-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon name="User" size={24} className="text-primary" />
                </div>
                <div>
                  <div className="font-bold mb-2">Алексей М.</div>
                  <div className="text-muted-foreground">
                    "Лучший VPN который я пробовал. Быстрый, стабильный и доступная цена. Рекомендую!"
                  </div>
                  <div className="flex gap-1 mt-3">
                    {[1,2,3,4,5].map(i => <Icon key={i} name="Star" size={16} className="text-primary fill-primary" />)}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-2 p-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon name="User" size={24} className="text-primary" />
                </div>
                <div>
                  <div className="font-bold mb-2">Мария К.</div>
                  <div className="text-muted-foreground">
                    "Пользуюсь уже полгода. Отличная поддержка, всегда помогают. Скорость стабильная, без обрывов."
                  </div>
                  <div className="flex gap-1 mt-3">
                    {[1,2,3,4,5].map(i => <Icon key={i} name="Star" size={16} className="text-primary fill-primary" />)}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-2 p-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon name="User" size={24} className="text-primary" />
                </div>
                <div>
                  <div className="font-bold mb-2">Дмитрий П.</div>
                  <div className="text-muted-foreground">
                    "Доступ ко всем сайтам и сервисам без проблем. Vless Reality работает безупречно!"
                  </div>
                  <div className="flex gap-1 mt-3">
                    {[1,2,3,4,5].map(i => <Icon key={i} name="Star" size={16} className="text-primary fill-primary" />)}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-2 p-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon name="User" size={24} className="text-primary" />
                </div>
                <div>
                  <div className="font-bold mb-2">Анна С.</div>
                  <div className="text-muted-foreground">
                    "Просто настроить, быстро работает. Годовой тариф очень выгодный. Спасибо команде!"
                  </div>
                  <div className="flex gap-1 mt-3">
                    {[1,2,3,4,5].map(i => <Icon key={i} name="Star" size={16} className="text-primary fill-primary" />)}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-4" id="training">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Обучение</h2>
            <p className="text-xl text-muted-foreground">
              Пошаговые инструкции по подключению и настройке
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary transition-all duration-300 overflow-hidden group">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Icon name="Smartphone" size={48} className="text-primary" />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-black w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  iOS / iPhone
                </CardTitle>
                <CardDescription>
                  Подробная инструкция по установке и настройке VPN на устройствах Apple
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="outline" className="w-full button-glow" asChild>
                  <a href="https://t.me/gospeedvpn" target="_blank" rel="noopener noreferrer">
                    Смотреть инструкцию
                  </a>
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-2 hover:border-primary transition-all duration-300 overflow-hidden group">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Icon name="Smartphone" size={48} className="text-primary" />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-black w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Android
                </CardTitle>
                <CardDescription>
                  Пошаговое руководство для установки VPN на Android-устройства
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="outline" className="w-full button-glow" asChild>
                  <a href="https://t.me/gospeedvpn" target="_blank" rel="noopener noreferrer">
                    Смотреть инструкцию
                  </a>
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-2 hover:border-primary transition-all duration-300 overflow-hidden group">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Icon name="Monitor" size={48} className="text-primary" />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-black w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  Windows / macOS
                </CardTitle>
                <CardDescription>
                  Инструкция для настройки VPN на компьютерах и ноутбуках
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="outline" className="w-full button-glow" asChild>
                  <a href="https://t.me/gospeedvpn" target="_blank" rel="noopener noreferrer">
                    Смотреть инструкцию
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Card className="border-2 border-primary/50 p-8 bg-primary/5">
              <div className="flex flex-col md:flex-row items-center gap-6 justify-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="HelpCircle" size={32} className="text-black" />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2">Нужна помощь с настройкой?</h3>
                  <p className="text-muted-foreground mb-4">
                    Наша служба поддержки готова помочь вам 24/7
                  </p>
                  <Button className="button-glow" asChild>
                    <a href="https://t.me/gospeedvpn" target="_blank" rel="noopener noreferrer">
                      Связаться с поддержкой
                    </a>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-4" id="faq">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Частые вопросы</h2>
            <p className="text-xl text-muted-foreground">
              Ответы на самые популярные вопросы о нашем сервисе
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-2 rounded-xl mb-4 px-6">
                <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="py-20 px-4 bg-primary text-black">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Готовы начать защищённый сёрфинг?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Присоединяйтесь к миллионам пользователей, которые доверяют нам свою безопасность
          </p>
          <Button size="lg" variant="secondary" className="rounded-full text-lg px-8 h-14 bg-black text-white hover:bg-black/80 button-glow" asChild>
            <a href="https://t.me/shopspeedvpn_bot" target="_blank" rel="noopener noreferrer">
              Попробовать бесплатно
            </a>
          </Button>
        </div>
      </section>

      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="https://cdn.poehali.dev/files/3a0045b1-8f62-461c-946f-ea67286d8040.png" alt="Speed VPN" className="w-8 h-8 rounded-lg" />
                <span className="text-lg font-bold">SPEED VPN</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Ваша безопасность в интернете — наш приоритет
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Продукт</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Возможности</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Тарифы</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Серверы</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Поддержка</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Контакты</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Справка</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Компания</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">О нас</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Блог</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Карьера</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2024 Speed VPN. Все права защищены
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;