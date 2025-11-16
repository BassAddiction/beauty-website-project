import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Icon from "@/components/ui/icon";
import { useState } from "react";
import { CDN_ASSETS } from '@/config/api';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={CDN_ASSETS.CLIENT_ICONS.WINDOWS} alt="Speed VPN" className="w-8 h-8 rounded-lg hover:scale-110 transition-transform duration-300" />
          <span className="text-xl font-bold">SPEED VPN</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="/#features" className="text-sm font-medium hover:text-primary transition-colors">Возможности</a>
          <a href="/#pricing" className="text-sm font-medium hover:text-primary transition-colors">Тарифы</a>
          <a href="/reviews" className="text-sm font-medium hover:text-primary transition-colors">Отзывы</a>
          <a href="/#training" className="text-sm font-medium hover:text-primary transition-colors">Обучение</a>
          <a href="/#faq" className="text-sm font-medium hover:text-primary transition-colors">FAQ</a>
          <a href="/clients" className="text-sm font-medium hover:text-primary transition-colors">VPN-Клиенты</a>
        </nav>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hidden md:flex rounded-full" asChild>
            <a href="/get-access">
              <Icon name="Key" className="w-4 h-4 mr-2" />
              Восстановить доступ
            </a>
          </Button>
          <Button variant="outline" className="hidden md:flex rounded-full" asChild>
            <a href="/login">
              <Icon name="User" className="w-4 h-4 mr-2" />
              Личный кабинет
            </a>
          </Button>
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Icon name="Menu" size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-black/95 border-border">
              <nav className="flex flex-col gap-6 mt-8">
                <a 
                  href="/#features" 
                  className="text-lg font-medium hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Возможности
                </a>
                <a 
                  href="/#pricing" 
                  className="text-lg font-medium hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Тарифы
                </a>
                <a 
                  href="/reviews" 
                  className="text-lg font-medium hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Отзывы
                </a>
                <a 
                  href="/#training" 
                  className="text-lg font-medium hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Обучение
                </a>
                <a 
                  href="/#faq" 
                  className="text-lg font-medium hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  FAQ
                </a>
                <a 
                  href="/clients" 
                  className="text-lg font-medium hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  VPN-Клиенты
                </a>
                <Button variant="ghost" className="rounded-full mt-4" asChild>
                  <a href="/get-access">
                    <Icon name="Key" className="w-4 h-4 mr-2" />
                    Восстановить доступ
                  </a>
                </Button>
                <Button variant="outline" className="rounded-full" asChild>
                  <a href="/login">
                    <Icon name="User" className="w-4 h-4 mr-2" />
                    Личный кабинет
                  </a>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;