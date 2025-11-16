import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const ClientsPage = () => {
  const detectPlatform = (): string => {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();

    if (/iphone|ipad|ipod/.test(userAgent)) {
      return "iOS";
    } else if (/android/.test(userAgent)) {
      return "Android";
    } else if (/mac/.test(platform)) {
      return "macOS";
    } else if (/win/.test(platform)) {
      return "Windows";
    } else if (/linux/.test(platform)) {
      return "Linux";
    }
    return "Windows";
  };

  const [selectedPlatform, setSelectedPlatform] = useState<string>(detectPlatform());

  const platforms = [
    { id: "Android", name: "Android", icon: "Smartphone", shortName: "Android" },
    { id: "iOS", name: "iOS", icon: "Apple", shortName: "iOS" },
    { id: "Windows", name: "Windows", icon: "Monitor", shortName: "Windows" },
    { id: "macOS", name: "macOS", icon: "Laptop", shortName: "Mac" },
    { id: "Linux", name: "Linux", icon: "Terminal", shortName: "Linux" },
  ];

  const clients = {
    Android: [
      {
        name: "Happ",
        description: "Рекомендуемый клиент для Android",
        featured: true,
        link: "https://play.google.com/store/apps/details?id=com.happproxy",
      },
      {
        name: "Clash Meta",
        description: "Альтернативный клиент",
        featured: false,
        link: "https://github.com/MetaCubeX/ClashMetaForAndroid/releases/download/v2.11.7/cmfa-2.11.7-meta-universal-release.apk",
      },
    ],
    iOS: [
      {
        name: "Happ",
        description: "Рекомендуемый клиент для iOS",
        featured: true,
        link: "https://apps.apple.com/ru/app/happ-proxy-utility-plus/id6746188973",
      },
    ],
    Windows: [
      {
        name: "Clash Verge",
        description: "Рекомендуемый клиент для Windows",
        featured: true,
        link: "https://github.com/clash-verge-rev/clash-verge-rev/releases/download/v2.2.2/Clash.Verge_2.2.2_x64-setup.exe",
      },
    ],
    macOS: [
      {
        name: "Clash Verge (Intel)",
        description: "Для процессоров Intel",
        featured: true,
        link: "https://github.com/clash-verge-rev/clash-verge-rev/releases/download/v2.2.2/Clash.Verge_2.2.2_x64.dmg",
      },
      {
        name: "Clash Verge (Apple Silicon)",
        description: "Для процессоров M1/M2/M3",
        featured: true,
        link: "https://github.com/clash-verge-rev/clash-verge-rev/releases/download/v2.2.2/Clash.Verge_2.2.2_aarch64.dmg",
      },
    ],
    Linux: [
      {
        name: "Clash Verge",
        description: "Все версии для Linux",
        featured: true,
        link: "https://github.com/clash-verge-rev/clash-verge-rev/releases",
      },
    ],
  };

  const instructions = [
    {
      step: 1,
      title: "Скачайте клиент",
      description: "Выберите подходящую версию для вашей системы и нажмите на кнопку ниже для установки",
      icon: "Download",
    },
    {
      step: 2,
      title: "Установите приложение",
      description: "Запустите установочный файл и следуйте инструкциям на экране",
      icon: "PackageOpen",
    },
    {
      step: 3,
      title: "Добавьте подписку",
      description: "Нажмите кнопку ниже, чтобы добавить подписку в приложение",
      icon: "Link",
      action: true,
    },
    {
      step: 4,
      title: "Если подписка не добавилась",
      description: "Если после нажатия на кнопку ничего не произошло, добавьте подписку вручную. Нажмите на этой странице кнопку 'Получить ссылку' в правом верхнем углу, скопируйте ссылку. В приложении перейдите в раздел Профили и вставьте ссылку в текстовое поле, затем нажмите на кнопку Импорт",
      icon: "AlertCircle",
    },
    {
      step: 5,
      title: "Подключите и используйте",
      description: "Выберите сервер из списка и нажмите кнопку подключения",
      icon: "Rocket",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 md:mb-4">
            Установка VPN клиента
          </h1>
          <p className="text-base md:text-xl text-blue-200">
            Выберите вашу платформу и следуйте инструкциям
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-blue-500/20 mb-8">
            <div className="flex justify-center mb-8">
              <div className="w-full max-w-md">
                <label className="block text-sm font-medium text-blue-200 mb-3 text-center">
                  Выберите вашу операционную систему
                </label>
                <div className="relative">
                  <select
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    className="w-full bg-gray-900/80 border-2 border-cyan-500/50 text-white rounded-xl px-4 py-3 pr-10 appearance-none cursor-pointer focus:outline-none focus:border-cyan-400 transition-colors text-lg font-medium"
                  >
                    {platforms.map((platform) => (
                      <option key={platform.id} value={platform.id}>
                        {platform.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Icon name="ChevronDown" size={24} className="text-cyan-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {clients[selectedPlatform as keyof typeof clients].map((client, index) => (
                <div
                  key={index}
                  className={`p-4 md:p-6 rounded-xl border transition-all ${
                    client.featured
                      ? "bg-cyan-500/10 border-cyan-500/50"
                      : "bg-gray-900/30 border-gray-700"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {client.featured && (
                          <Icon name="Star" size={18} className="text-cyan-400 flex-shrink-0" />
                        )}
                        <h3 className="text-lg md:text-xl font-bold text-white">{client.name}</h3>
                      </div>
                      <p className="text-sm md:text-base text-gray-400">{client.description}</p>
                    </div>
                    <a
                      href={client.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors text-sm md:text-base whitespace-nowrap"
                    >
                      <Icon name="Download" size={18} />
                      Скачать
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-blue-500/20">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-6 md:mb-8 text-center">
              Инструкция по установке
            </h2>

            <div className="relative">
              <div className="absolute left-4 md:left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-cyan-500 via-blue-500 to-cyan-500"></div>

              <div className="space-y-6">
                {instructions.map((instruction) => (
                  <div key={instruction.step} className="relative flex gap-3 md:gap-6">
                    <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-cyan-500 flex items-center justify-center z-10 border-2 md:border-4 border-gray-900">
                      <Icon name={instruction.icon} size={18} className="text-white md:w-5 md:h-5" />
                    </div>

                    <div className="flex-1 pt-1 pb-4">
                      <h3 className="text-base md:text-lg font-bold text-white mb-2">
                        {instruction.title}
                      </h3>
                      <p className="text-sm md:text-base text-gray-400 leading-relaxed">
                        {instruction.description}
                      </p>
                      {instruction.action && (
                        <button className="mt-3 md:mt-4 px-4 md:px-6 py-2.5 md:py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-medium text-sm md:text-base w-full md:w-auto">
                          Добавить подписку
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 md:mt-8 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 md:p-6">
            <div className="flex gap-3 md:gap-4">
              <Icon name="Info" size={20} className="text-yellow-400 flex-shrink-0 mt-1 md:w-6 md:h-6" />
              <div>
                <h3 className="text-base md:text-lg font-bold text-yellow-300 mb-2">
                  Важная информация
                </h3>
                <ul className="space-y-2 text-sm md:text-base text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span>На iOS требуется установка профиля VPN в настройках системы</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span>На Android может потребоваться разрешение на установку из неизвестных источников</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span>Держите приложение обновленным для лучшей производительности</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsPage;