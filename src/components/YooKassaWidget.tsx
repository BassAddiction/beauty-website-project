import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface YooKassaWidgetProps {
  confirmationToken: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

declare global {
  interface Window {
    YooMoneyCheckoutWidget: any;
  }
}

const YooKassaWidget = ({ confirmationToken, onSuccess, onError }: YooKassaWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!confirmationToken) {
      console.error('❌ No confirmation token provided');
      return;
    }

    console.log('🔹 YooKassa Widget: Starting initialization with token:', confirmationToken?.substring(0, 20));
    
    // Проверяем, не загружен ли уже скрипт
    const existingScript = document.querySelector('script[src*="checkout-widget.js"]');
    
    const initWidget = () => {
      console.log('✅ YooKassa script loaded');
      
      if (!window.YooMoneyCheckoutWidget) {
        console.error('❌ YooMoneyCheckoutWidget not found in window');
        onError('Не удалось загрузить виджет оплаты');
        return;
      }
      
      // Ждём, пока контейнер будет доступен
      const checkContainer = setInterval(() => {
        if (containerRef.current) {
          clearInterval(checkContainer);
          
          try {
            console.log('🔹 Creating widget instance...');
            // Инициализируем виджет с кастомизацией
            widgetRef.current = new window.YooMoneyCheckoutWidget({
              confirmation_token: confirmationToken,
              return_url: window.location.origin + '/payment-success',
              
              // Кастомизация дизайна
              customization: {
                colors: {
                  control_primary: '#ff0000',
                  control_primary_content: '#ffffff',
                  background: '#0a0a0a',
                  icons: '#ffffff',
                  control: '#1a1a1a',
                  placeholder: '#666666',
                  text: '#ffffff',
                  link: '#ff0000'
                },
                border_radius: '12'
              },
              
              error_callback: (error: any) => {
                console.error('❌ YooKassa widget error:', error);
                onError(error.error || 'Ошибка оплаты');
                toast({
                  title: '❌ Ошибка оплаты',
                  description: error.error || 'Попробуйте снова',
                  variant: 'destructive'
                });
              }
            });

            console.log('🔹 Rendering widget...');
            // Рендерим виджет
            widgetRef.current.render(containerRef.current);

            console.log('✅ Widget rendered successfully');

            // Слушаем успешную оплату
            widgetRef.current.on('success', () => {
              console.log('✅ Payment success event received');
              toast({
                title: '✅ Оплата успешна',
                description: 'Перенаправляем...'
              });
              setTimeout(() => {
                onSuccess();
              }, 1000);
            });
          } catch (error) {
            console.error('❌ Error creating widget:', error);
            onError('Ошибка инициализации виджета');
          }
        }
      }, 100);
      
      // Таймаут на случай если контейнер не появится
      setTimeout(() => {
        clearInterval(checkContainer);
        if (!containerRef.current) {
          console.error('❌ Container timeout');
          onError('Ошибка загрузки формы оплаты');
        }
      }, 5000);
    };
    
    if (existingScript && window.YooMoneyCheckoutWidget) {
      // Скрипт уже загружен
      initWidget();
    } else {
      // Загружаем скрипт ЮКассы
      const script = document.createElement('script');
      script.src = 'https://yookassa.ru/checkout-widget/v1/checkout-widget.js';
      script.async = true;
      
      script.onload = initWidget;
      
      script.onerror = () => {
        console.error('❌ Failed to load YooKassa script');
        onError('Не удалось загрузить виджет оплаты');
      };

      document.body.appendChild(script);
    }

    // Cleanup
    return () => {
      if (widgetRef.current && widgetRef.current.destroy) {
        widgetRef.current.destroy();
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [confirmationToken, onSuccess, onError, toast]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div ref={containerRef} className="min-h-[400px]" />
    </div>
  );
};

export default YooKassaWidget;