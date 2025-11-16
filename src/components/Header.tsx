import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Icon from "@/components/ui/icon";
import { useState } from "react";
import { CDN_ASSETS } from '@/config/api';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-black via-black/95 to-black backdrop-blur-xl border-b border-primary/20 shadow-lg shadow-primary/5">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-primary/5 opacity-50"></div>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between relative">
        <div className="flex items-center gap-2">
          <img src={CDN_ASSETS.CLIENT_ICONS.WINDOWS} alt="Speed VPN" className="w-8 h-8 rounded-lg hover:scale-110 transition-transform duration-300" />
          <span className="text-xl font-bold">SPEED VPN</span>
        </div>
        <nav className="hidden md:flex items-center gap-1">
          <a href="/#features" className="relative px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-all duration-300 group">
            <span className="relative z-10">Возможности</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </a>
          <a href="/#pricing" className="relative px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-all duration-300 group">
            <span className="relative z-10">Тарифы</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </a>
          <a href="/reviews" className="relative px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-all duration-300 group">
            <span className="relative z-10">Отзывы</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </a>
          <a href="/#training" className="relative px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-all duration-300 group">
            <span className="relative z-10">Обучение</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </a>
          <a href="/#faq" className="relative px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-all duration-300 group">
            <span className="relative z-10">FAQ</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </a>
          <a href="/clients" className="relative px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-all duration-300 group">
            <span className="relative z-10">VPN-Клиенты</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="hidden md:flex rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-300 relative group" asChild>
            <a href="/get-access">
              <Icon name="Key" className="w-4 h-4 mr-2" />
              Восстановить доступ
              <div className="absolute inset-0 bg-primary/5 rounded-full opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
            </a>
          </Button>
          <Button variant="outline" className="hidden md:flex rounded-full border-2 border-primary/40 hover:border-primary hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 relative group" asChild>
            <a href="/login">
              <Icon name="User" className="w-4 h-4 mr-2" />
              Личный кабинет
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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