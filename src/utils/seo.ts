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

  const existingScript = document.querySelector('script[data-schema-type]');
  if (existingScript) {
    existingScript.remove();
  }

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-schema-type', 'dynamic');
  script.text = JSON.stringify(data);
  document.head.appendChild(script);
};

export const createBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url
    }))
  };
};

export const createOrganizationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'Speed VPN',
    'url': 'https://speedvpn.io',
    'logo': 'https://speedvpn.io/favicon.svg',
    'description': 'Быстрый и безопасный VPN-сервис для России с Vless Reality протоколом',
    'address': {
      '@type': 'PostalAddress',
      'addressCountry': 'RU'
    },
    'sameAs': [
      'https://t.me/speedvpn_support'
    ]
  };
};

export const createProductSchema = (product: {
  name: string;
  description: string;
  price: string;
  priceCurrency: string;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'description': product.description,
    'offers': {
      '@type': 'Offer',
      'price': product.price,
      'priceCurrency': product.priceCurrency,
      'availability': 'https://schema.org/InStock',
      'url': 'https://speedvpn.io/buy-vpn'
    }
  };
};

export const createWebPageSchema = (page: {
  name: string;
  description: string;
  url: string;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': page.name,
    'description': page.description,
    'url': page.url,
    'isPartOf': {
      '@type': 'WebSite',
      'name': 'Speed VPN',
      'url': 'https://speedvpn.io'
    }
  };
};

export const pageSEO = {
  home: {
    title: 'Speed VPN — Быстрый и безопасный VPN для России от 79₽',
    description: 'Надёжный VPN-сервис с Vless Reality протоколом. Доступ к YouTube, Telegram, ChatGPT. 30 ГБ/день, безлимитные устройства. Мгновенная активация от 79₽.',
    keywords: 'vpn для россии, купить vpn, vpn недорого, vless reality, vpn youtube, vpn telegram, быстрый vpn',
    ogImage: 'https://speedvpn.io/favicon.svg'
  },
  
  buyVpn: {
    title: 'Купить VPN для России 2025 — Speed VPN от 79₽ с оплатой картой РФ',
    description: 'Покупка VPN для России: оплата российскими картами МИР, Visa, Mastercard. Мгновенная активация. Vless Reality протокол не блокируется РКН. Работает на всех устройствах. Тарифы от 79₽/неделя.',
    keywords: 'купить vpn россия, vpn российской картой, оплата vpn мир, купить впн 2025, тарифы vpn цена',
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
    title: 'VPN для ChatGPT из России — доступ к OpenAI, GPT-4, Claude, Midjourney',
    description: 'Полный доступ к ChatGPT из России через Speed VPN. Работает с GPT-4, DALL-E, Claude, Midjourney, GitHub Copilot. Стабильное соединение без блокировки аккаунта. Vless Reality обходит детекцию OpenAI. От 79₽/неделя.',
    keywords: 'vpn для chatgpt россия, chatgpt из рф, openai vpn, claude midjourney доступ, gpt-4 через vpn',
    ogImage: 'https://speedvpn.io/favicon.svg'
  },

  vpnRussia: {
    title: 'VPN для России 2025 — обход блокировок РКН, YouTube, Telegram',
    description: 'Лучший VPN для России в 2025 году. Обход блокировок Роскомнадзора: YouTube, Instagram, Facebook, Discord. Vless Reality не блокируется DPI. Стабильная работа при замедлении. От 79₽/неделя.',
    keywords: 'vpn для россии 2025, обход ркн, впн роскомнадзор, разблокировка ютуб инстаграм, vpn dpi обход',
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
  },

  clients: {
    title: 'VPN Клиенты для всех устройств — Скачать Speed VPN',
    description: 'Скачайте VPN клиенты для Windows, macOS, iOS, Android, Linux. Clash Verge, Hiddify, Happ. Подробная инструкция по установке и настройке.',
    keywords: 'vpn клиент, скачать vpn, clash verge, hiddify, happ, vpn приложение, vpn для windows, vpn для mac, vpn для android, vpn для ios',
    ogImage: 'https://speedvpn.io/favicon.svg'
  },

  vpnInstagram: {
    title: 'VPN для Instagram — Быстрый доступ к Stories и Reels | Speed VPN',
    description: 'Пользуйтесь Instagram без ограничений с Speed VPN. Смотрите Stories, Reels, публикуйте посты. Высокая скорость, стабильное соединение. От 79₽/неделя.',
    keywords: 'vpn для instagram, впн инстаграм, разблокировка instagram, доступ к instagram, instagram reels, instagram stories',
    ogImage: 'https://cdn.poehali.dev/files/a723c7b2-8fbc-4b21-b03e-eea510930592.jpg'
  },

  vpnFacebook: {
    title: 'VPN для Facebook — Стабильный доступ к соцсети | Speed VPN',
    description: 'Используйте Facebook без блокировок с Speed VPN. Общайтесь с друзьями, смотрите видео, публикуйте посты. Быстрое и надёжное соединение. От 79₽/неделя.',
    keywords: 'vpn для facebook, впн фейсбук, разблокировка facebook, доступ к facebook, facebook messenger',
    ogImage: 'https://cdn.poehali.dev/files/8d467536-0939-4846-af54-6c838202e269.jpg'
  },

  vpnTwitter: {
    title: 'VPN для X (Twitter) — Полный доступ из России | Speed VPN',
    description: 'Доступ к X (Twitter) без ограничений с Speed VPN. Читайте твиты, публикуйте посты, смотрите видео. Vless Reality протокол. От 79₽/неделя.',
    keywords: 'vpn для twitter, vpn для x, впн твиттер, разблокировка twitter, доступ к twitter, twitter x',
    ogImage: 'https://cdn.poehali.dev/files/ce3c2f14-2ee3-46b2-acee-89296479b8cd.jpg'
  }
};