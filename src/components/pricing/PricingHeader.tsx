interface PricingHeaderProps {
  showBuilderButton: boolean;
  onTestWebhook: () => void;
  testing: boolean;
}

export const PricingHeader = ({ showBuilderButton, onTestWebhook, testing }: PricingHeaderProps) => {
  return (
    <div className="text-center mb-16 animate-fade-in">
      <h2 className="text-4xl md:text-6xl font-black mb-4">Тарифы VPN — Купить от 79₽</h2>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        Доступные цены на VPN-подписку. Выберите тариф и получите
        полный доступ ко всем функциям
      </p>
      
      {showBuilderButton && (
        <button
          onClick={onTestWebhook}
          disabled={testing}
          className="mt-4 px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg text-sm transition-colors"
        >
          {testing ? 'Отправка...' : 'Test webhook'}
        </button>
      )}
    </div>
  );
};
