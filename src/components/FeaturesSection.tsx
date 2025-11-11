import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const FeaturesSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="py-20 px-4" id="features">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
          Почему выбирают Speed VPN — лучший VPN-сервис для России
        </h2>
        <div className={`grid md:grid-cols-3 gap-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Icon name="Shield" size={24} className="text-primary" />
              </div>
              <CardTitle>Безопасный VPN с Vless Reality</CardTitle>
              <CardDescription>
                Современный протокол Vless Reality с усиленным шифрованием обеспечивает максимальную конфиденциальность и гарантированный обход блокировок в России. Ваши данные под надёжной защитой.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Icon name="Zap" size={24} className="text-primary" />
              </div>
              <CardTitle>Быстрый VPN без лагов</CardTitle>
              <CardDescription>
                Высокоскоростные серверы в 50+ локациях мира гарантируют стабильное соединение для просмотра видео в 4K, онлайн-игр и работы. Минимальные задержки.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Icon name="Globe" size={24} className="text-primary" />
              </div>
              <CardTitle>Неограниченный доступ к сайтам</CardTitle>
              <CardDescription>
                Открывайте YouTube, Instagram, Facebook, Netflix, ChatGPT и другие заблокированные сервисы из России. Безлимитные устройства, 30 ГБ трафика ежедневно.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;