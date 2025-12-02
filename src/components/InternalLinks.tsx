import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';

interface InternalLink {
  title: string;
  description: string;
  path: string;
  icon: string;
}

const links: InternalLink[] = [
  {
    title: 'VPN для YouTube',
    description: 'Смотрите любимые видео без ограничений',
    path: '/vpn-youtube',
    icon: 'Youtube'
  },
  {
    title: 'VPN для Telegram',
    description: 'Безопасное общение без блокировок',
    path: '/vpn-telegram',
    icon: 'MessageCircle'
  },
  {
    title: 'VPN для ChatGPT',
    description: 'Полный доступ к ИИ-ассистенту',
    path: '/vpn-chatgpt',
    icon: 'Bot'
  },
  {
    title: 'VPN для Instagram',
    description: 'Stories, Reels и общение без ограничений',
    path: '/vpn-instagram',
    icon: 'Camera'
  },
  {
    title: 'VPN для Facebook',
    description: 'Полный доступ к соцсети и Messenger',
    path: '/vpn-facebook',
    icon: 'Users'
  },
  {
    title: 'VPN для X (Twitter)',
    description: 'Читайте твиты и публикуйте посты',
    path: '/vpn-twitter',
    icon: 'Bird'
  },
  {
    title: 'VPN для России',
    description: 'Обход всех блокировок Роскомнадзора',
    path: '/vpn-russia',
    icon: 'Globe'
  },
  {
    title: 'Купить VPN',
    description: 'Выгодные тарифы от 79₽',
    path: '/buy-vpn',
    icon: 'ShoppingCart'
  }
];

export const InternalLinks = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Все возможности Speed VPN
          </h2>
          <p className="text-muted-foreground text-lg">
            Выберите VPN-решение под ваши задачи
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="group bg-card rounded-xl p-6 border border-border hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon name={link.icon} size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {link.description}
                  </p>
                </div>
                <Icon 
                  name="ArrowRight" 
                  size={20} 
                  className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" 
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};