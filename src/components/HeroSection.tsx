import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

const HeroSection = () => {
  return (
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
              <CardTitle>Без ограничений</CardTitle>
              <CardDescription>
                Получите доступ к любому контенту из любой точки мира без географических ограничений
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
