import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useParallax } from "@/hooks/useParallax";
import { CDN_ASSETS } from '@/config/api';

const HeroSection = () => {
  const offsetY = useParallax();

  return (
    <section className="pt-32 pb-20 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Text content */}
          <div className="text-center md:text-left animate-fade-in">
            <div className="md:hidden mb-6 flex justify-center">
              <img 
                src={CDN_ASSETS.LOGO} 
                alt="Speed VPN" 
                className="w-24 h-24 rounded-full object-cover border-2 border-primary logo-animated"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
              <span className="hidden md:inline">Подключить VPN для России — быстрый и безопасный<br /></span>
              <span className="text-primary">Speed VPN — Ваша цифровая свобода</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Получите доступ к YouTube, Nelzagram, Facebook, ChatGPT. Надёжный VPN-сервис от 79 руб. Работает на iOS, Android, Windows, Mac. Безлимитные устройства, 30 ГБ трафика в день.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 md:justify-start justify-center items-center">
              <Button size="lg" className="rounded-full text-lg px-8 h-14 button-glow" asChild>
                <a href="/register">
                  Подключить
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-full text-lg px-8 h-14 border-2 border-primary/50 hover:border-primary hover:bg-primary/10 transition-all duration-300" 
                asChild
              >
                <a href="https://t.me/shopspeedvpn_bot" target="_blank" rel="noopener noreferrer">
                  <Icon name="Send" className="w-5 h-5 mr-2" />
                  Подключить в Telegram
                </a>
              </Button>
            </div>
          </div>

          {/* Right side - Hero image (desktop only) */}
          <div className="hidden md:block relative">
            <div className="relative rounded-3xl overflow-hidden border-4 border-primary/30 shadow-2xl hover:border-primary/50 transition-all duration-300 hover:scale-105">
              <img 
                src="https://cdn.poehali.dev/files/044d42f8-bc65-4b24-b4fa-30168963877b.jpg"
                alt="Speed VPN работает с YouTube - демонстрация приложения"
                className="w-full h-auto object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            </div>
            {/* Decorative glow effect */}
            <div className="absolute -inset-4 bg-primary/20 rounded-3xl blur-3xl -z-10 opacity-50 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;