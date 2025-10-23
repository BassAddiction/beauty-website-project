import Icon from "@/components/ui/icon";

const Footer = () => {
  return (
    <footer className="py-12 px-4 border-t border-border">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="https://cdn.poehali.dev/files/3a0045b1-8f62-461c-946f-ea67286d8040.png" alt="Speed VPN" className="w-8 h-8 rounded-lg" />
              <span className="text-xl font-bold">SPEED VPN</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Ваша конфиденциальность — наш приоритет
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Продукт</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-primary transition-colors">Возможности</a></li>
              <li><a href="#pricing" className="hover:text-primary transition-colors">Тарифы</a></li>
              <li><a href="#training" className="hover:text-primary transition-colors">Обучение</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Поддержка</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#faq" className="hover:text-primary transition-colors">FAQ</a></li>
              <li><a href="https://t.me/gospeedvpn" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Связаться с нами</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Соцсети</h4>
            <div className="flex gap-4">
              <a href="https://t.me/shopspeedvpn_bot" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Icon name="Send" size={20} className="text-primary" />
              </a>
              <a href="https://t.me/gospeedvpn" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Icon name="MessageCircle" size={20} className="text-primary" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2024 Speed VPN. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
