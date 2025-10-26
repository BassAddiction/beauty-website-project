import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useParallax } from "@/hooks/useParallax";

const HeroSection = () => {
  const offsetY = useParallax();

  return (
    <section className="pt-32 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 animate-fade-in">
          <div className="md:hidden mb-6 flex justify-center">
            <img 
              src="https://cdn.poehali.dev/files/299c507f-f10f-4048-a927-9fa71def332e.jpg" 
              alt="Speed VPN" 
              className="w-24 h-24 rounded-full object-cover border-2 border-primary logo-animated"
            />
          </div>
          <h1 
            className="text-5xl md:text-7xl font-black mb-6 tracking-tight transition-transform duration-100"
            style={{ transform: `translateY(${offsetY * 0.3}px)` }}
          >
            <span className="hidden md:inline">Быстрый и безопасный<br /></span>
            <span className="text-primary">VPN-сервис</span>
          </h1>
          <p 
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto transition-transform duration-100"
            style={{ transform: `translateY(${offsetY * 0.15}px)` }}
          >
            Защитите свою конфиденциальность в интернете. Высокая скорость, надёжное шифрование и доступ к любому контенту
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="rounded-full text-lg px-8 h-14 button-glow" asChild>
              <a href="/register">
                Подключить
              </a>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full text-lg px-8 h-14" asChild>
              <a href="https://t.me/shopspeedvpn_bot" target="_blank" rel="noopener noreferrer">
                Подключить в Telegram
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;