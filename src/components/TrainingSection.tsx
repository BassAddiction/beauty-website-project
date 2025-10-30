import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const TrainingSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="py-20 px-4" id="training">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-black mb-4">Как начать</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Три простых шага до полной защиты вашей конфиденциальности
          </p>
        </div>

        <div className={`grid md:grid-cols-3 gap-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Card className="border-2 hover:border-primary transition-all duration-300">
            <CardHeader>
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-3xl font-black text-primary">1</span>
              </div>
              <CardTitle>Выберите тариф</CardTitle>
              <CardDescription>
                Оформите подписку на сайте или через удобного бота в Telegram. Мгновенная активация после оплаты
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-all duration-300">
            <CardHeader>
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-3xl font-black text-primary">2</span>
              </div>
              <CardTitle>Скачайте приложение</CardTitle>
              <CardDescription>
                Установите приложение на ваше устройство. Поддерживаем iOS, Android, Windows, macOS и Linux
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-all duration-300">
            <CardHeader>
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-3xl font-black text-primary">3</span>
              </div>
              <CardTitle>Подключитесь</CardTitle>
              <CardDescription>
                Введите полученные данные в приложение и наслаждайтесь безопасным интернетом одним нажатием
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className={`mt-16 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-3xl p-8 md:p-12 border-2 border-primary/20 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h3 className="text-3xl md:text-4xl font-black mb-4">Готовы начать?</h3>
              <p className="text-lg text-muted-foreground mb-6">
                Присоединяйтесь к тысячам пользователей, которые уже защитили свою конфиденциальность
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-bold transition-all button-glow"
                >
                  <Icon name="Globe" size={20} />
                  Подключить на сайте
                </a>
                <a 
                  href="https://t.me/shopspeedvpn_bot" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full font-bold transition-all"
                >
                  <Icon name="Send" size={20} />
                  Начать в Telegram
                </a>
                <a 
                  href="https://t.me/gospeedvpn" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full font-bold transition-all"
                >
                  <Icon name="MessageCircle" size={20} />
                  Связаться с поддержкой
                </a>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-primary/20 rounded-3xl flex items-center justify-center">
                <Icon name="Rocket" size={64} className="text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrainingSection;