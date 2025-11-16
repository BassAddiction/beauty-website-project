interface PricingHeaderProps {
  children?: React.ReactNode;
}

export const PricingHeader = ({ children }: PricingHeaderProps) => {
  return (
    <div className="text-center mb-16 animate-fade-in">
      <h2 className="text-4xl md:text-6xl font-black mb-4">Тарифы VPN — Купить от 79₽</h2>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        Доступные цены на VPN-подписку. Выберите тариф и получите мгновенный доступ к YouTube, заблокированным соцсетям, ChatGPT
      </p>
      {children}
    </div>
  );
};
