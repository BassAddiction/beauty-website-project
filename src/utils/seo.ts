interface SEOMetaTags {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
  noindex?: boolean;
}

export const updatePageMeta = (meta: SEOMetaTags) => {
  if (typeof document === 'undefined') return;

  document.title = meta.title;

  const updateOrCreateMeta = (name: string, content: string, property = false) => {
    const attr = property ? 'property' : 'name';
    let element = document.querySelector(`meta[${attr}="${name}"]`);
    
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attr, name);
      document.head.appendChild(element);
    }
    
    element.setAttribute('content', content);
  };

  updateOrCreateMeta('description', meta.description);
  
  if (meta.keywords) {
    updateOrCreateMeta('keywords', meta.keywords);
  }

  updateOrCreateMeta('og:title', meta.ogTitle || meta.title, true);
  updateOrCreateMeta('og:description', meta.ogDescription || meta.description, true);
  updateOrCreateMeta('og:url', window.location.href, true);
  
  if (meta.ogImage) {
    updateOrCreateMeta('og:image', meta.ogImage, true);
  }

  updateOrCreateMeta('twitter:title', meta.ogTitle || meta.title);
  updateOrCreateMeta('twitter:description', meta.ogDescription || meta.description);

  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = meta.canonical || window.location.origin + window.location.pathname;

  if (meta.noindex) {
    updateOrCreateMeta('robots', 'noindex, nofollow');
  } else {
    updateOrCreateMeta('robots', 'index, follow, max-snippet:-1, max-image-preview:large');
  }
};

export const addStructuredData = (data: object) => {
  if (typeof document === 'undefined') return;

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(data);
  document.head.appendChild(script);
};

export const pageSEO = {
  home: {
    title: 'Speed VPN — Быстрый и безопасный VPN для России от 79₽',
    description: 'Надёжный VPN-сервис с Vless Reality протоколом. Доступ к YouTube, Telegram, ChatGPT. 30 ГБ/день, безлимитные устройства. Мгновенная активация от 79₽.',
    keywords: 'vpn для россии, купить vpn, vpn недорого, vless reality, vpn youtube, vpn telegram, быстрый vpn',
    ogImage: 'https://speedvpn.io/favicon.svg'
  },
  
  buyVpn: {
    title: 'Купить VPN для России — Тарифы от 79₽ | Speed VPN',
    description: 'Выбирайте лучший тариф VPN для России. От 79₽ за неделю. Vless Reality протокол, 30 ГБ/день, безлимитные устройства. Мгновенная активация.',
    keywords: 'купить vpn, тарифы vpn, vpn цена, vpn от 79 рублей, подписка vpn, vpn недорого',
    ogImage: 'https://speedvpn.io/favicon.svg'
  },

  vpnYoutube: {
    title: 'VPN для YouTube — Быстрый доступ к видео | Speed VPN',
    description: 'Смотрите YouTube без ограничений с Speed VPN. Высокая скорость, стабильное соединение, HD качество. Vless Reality протокол. От 79₽/неделя.',
    keywords: 'vpn для youtube, впн ютуб, разблокировка youtube, доступ к youtube, смотреть youtube',
    ogImage: 'https://speedvpn.io/favicon.svg'
  },

  vpnTelegram: {
    title: 'VPN для Telegram — Стабильный доступ | Speed VPN',
    description: 'Пользуйтесь Telegram без блокировок с Speed VPN. Быстрое соединение, высокая надёжность. Vless Reality протокол. От 79₽/неделя.',
    keywords: 'vpn для telegram, впн телеграм, разблокировка telegram, доступ к telegram',
    ogImage: 'https://speedvpn.io/favicon.svg'
  },

  vpnChatGPT: {
    title: 'VPN для ChatGPT — Полный доступ из России | Speed VPN',
    description: 'Используйте ChatGPT из России с Speed VPN. Стабильное соединение, быстрый доступ. Vless Reality протокол. От 79₽/неделя.',
    keywords: 'vpn для chatgpt, впн чатгпт, доступ к chatgpt, chatgpt из россии',
    ogImage: 'https://speedvpn.io/favicon.svg'
  },

  vpnRussia: {
    title: 'VPN для России — Обход блокировок | Speed VPN',
    description: 'Лучший VPN для России. Обход блокировок Роскомнадзора, доступ ко всем сайтам. Vless Reality протокол, высокая скорость. От 79₽/неделя.',
    keywords: 'vpn для россии, обход блокировок, роскомнадзор, впн россия, разблокировка сайтов',
    ogImage: 'https://speedvpn.io/favicon.svg'
  },

  register: {
    title: 'Регистрация в Speed VPN — Создать аккаунт',
    description: 'Создайте аккаунт Speed VPN за минуту. Мгновенная активация, безопасный доступ к заблокированным сайтам.',
    keywords: 'регистрация vpn, создать аккаунт vpn, vpn регистрация',
    noindex: true
  },

  login: {
    title: 'Войти в Speed VPN — Личный кабинет',
    description: 'Войдите в личный кабинет Speed VPN для управления подпиской и настройками.',
    keywords: 'войти vpn, личный кабинет vpn, вход vpn',
    noindex: true
  },

  dashboard: {
    title: 'Личный кабинет Speed VPN — Управление подпиской',
    description: 'Управляйте вашей VPN-подпиской, просматривайте статистику использования, настраивайте параметры.',
    noindex: true
  },

  reviews: {
    title: 'Отзывы о Speed VPN — Реальные отзывы пользователей',
    description: 'Читайте честные отзывы пользователей Speed VPN. Более 1000 довольных клиентов. Средняя оценка 4.8/5.',
    keywords: 'отзывы speed vpn, отзывы vpn, speed vpn отзывы пользователей',
    ogImage: 'https://speedvpn.io/favicon.svg'
  },

  news: {
    title: 'Новости Speed VPN — Обновления и акции',
    description: 'Последние новости Speed VPN: обновления сервиса, новые функции, специальные предложения и акции.',
    keywords: 'новости vpn, обновления vpn, акции vpn',
    ogImage: 'https://speedvpn.io/favicon.svg'
  },

  terms: {
    title: 'Условия использования Speed VPN',
    description: 'Ознакомьтесь с условиями использования и политикой конфиденциальности Speed VPN.',
    noindex: true
  }
};
