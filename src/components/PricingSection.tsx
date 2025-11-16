import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import PaymentMethodDialog from "@/components/PaymentMethodDialog";
import API_ENDPOINTS from '@/config/api';
import { PricingHeader } from './pricing/PricingHeader';
import { PricingCard } from './pricing/PricingCard';
import { PaymentDialog } from './pricing/PaymentDialog';

interface Plan {
  id?: number;
  name: string;
  price: string;
  period: string;
  days?: number;
  popular?: boolean;
  custom?: boolean;
  features: string[];
}

const PricingSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [email, setEmail] = useState('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilderButton, setShowBuilderButton] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPaymentMethodDialog, setShowPaymentMethodDialog] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'sbp' | 'sberpay' | 'tpay' | null>(null);
  const [showAllPlans, setShowAllPlans] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [plansResponse, settingsResponse] = await Promise.all([
          fetch(`${API_ENDPOINTS.GET_SUBSCRIPTION}?action=get_plans`),
          fetch(`${API_ENDPOINTS.GET_SUBSCRIPTION}?action=get_builder_settings`)
        ]);
        
        const plansData = await plansResponse.json();
        
        const formattedPlans = plansData.plans
          .filter((plan: any) => plan.show_on && plan.show_on.includes('pricing'))
          .map((plan: any) => ({
            id: plan.id,
            name: plan.name,
            price: plan.price.toString(),
            period: '₽',
            days: plan.days,
            popular: plan.days === 90,
            custom: plan.custom,
            features: plan.features || []
          }));
        
        setPlans(formattedPlans);
        
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          console.log('Pricing settings data:', settingsData);
          const showButton = settingsData.settings?.show_on_pricing;
          console.log('Show button on pricing:', showButton);
          setShowBuilderButton(showButton !== undefined ? showButton : true);
        } else {
          setShowBuilderButton(true);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        setPlans(getDefaultPlans());
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const getDefaultPlans = () => [
    {
      name: "1 Месяц",
      price: "200",
      period: "₽",
      popular: true,
      features: [
        "30 ГБ трафика в сутки",
        "Без ограничений устройств",
        "Любые локации",
        "Базовая поддержка"
      ]
    }
  ];

  const handleTestWebhook = async () => {
    setTesting(true);
    try {
      const testUsername = `test_${Date.now()}`;
      const webhook = {
        type: 'notification',
        event: 'payment.succeeded',
        object: {
          id: `test_${Date.now()}`,
          status: 'succeeded',
          amount: { value: '1.00', currency: 'RUB' },
          metadata: {
            username: testUsername,
            plan_days: '1',
            plan_name: 'Test'
          },
          receipt: { customer: { email: 'test@test.com' } }
        }
      };
      
      const res = await fetch(API_ENDPOINTS.PAYMENT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhook)
      });
      
      toast({
        title: res.ok ? '✅ Webhook отправлен' : '❌ Ошибка',
        description: `Username: ${testUsername}. Проверь логи backend/payment`
      });
    } catch (e) {
      toast({ title: '❌ Ошибка', description: String(e), variant: 'destructive' });
    } finally {
      setTesting(false);
    }
  };

  const handleOpenPaymentDialog = (plan: Plan) => {
    setSelectedPlan(plan);
    setEmail('');
    setAgreedToTerms(false);
    setShowPaymentDialog(true);
  };

  const handleProceedToPaymentMethod = () => {
    if (!email.trim()) {
      toast({
        title: '❌ Заполните email',
        description: 'Введите Email перед оплатой',
        variant: 'destructive'
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: '❌ Некорректный email',
        description: 'Введите правильный адрес электронной почты',
        variant: 'destructive'
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: '❌ Примите условия',
        description: 'Необходимо принять условия оферты',
        variant: 'destructive'
      });
      return;
    }

    setShowPaymentDialog(false);
    setShowPaymentMethodDialog(true);
  };

  const handleSelectPaymentMethod = async (method: 'sbp' | 'sberpay' | 'tpay') => {
    setSelectedPaymentMethod(method);
    setShowPaymentMethodDialog(false);
    setPaying(true);

    try {
      const emailPrefix = email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '');
      const generatedUsername = emailPrefix + '_' + Date.now();
      const referralCode = localStorage.getItem('referral_code');
      
      console.log('💳 Starting payment with referral:', referralCode);
      
      const paymentResponse = await fetch(
        API_ENDPOINTS.PAYMENT,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: generatedUsername,
            email: email.trim(),
            amount: parseInt(selectedPlan!.price),
            plan_name: selectedPlan!.name,
            plan_days: selectedPlan!.days,
            plan_id: selectedPlan!.id,
            payment_method: method,
            domain: window.location.hostname,
            referral_code: referralCode
          })
        }
      );

      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        throw new Error(`Ошибка создания платежа: ${errorText}`);
      }

      const paymentData = await paymentResponse.json();
      
      localStorage.setItem('vpn_username', generatedUsername);
      localStorage.setItem('vpn_email', email.trim());
      localStorage.setItem('vpn_payment_id', paymentData.payment_id || '');

      if (paymentData.confirmation_url) {
        window.location.href = paymentData.confirmation_url;
      } else {
        toast({
          title: '❌ Ошибка создания платежа',
          description: paymentData.error || 'Не получена ссылка на оплату',
          variant: 'destructive'
        });
      }
    } catch (e) {
      console.error('Payment error:', e);
      toast({
        title: '❌ Ошибка подключения',
        description: e instanceof Error ? e.message : 'Проверьте интернет-соединение и попробуйте снова',
        variant: 'destructive'
      });
      setShowPaymentDialog(true);
    } finally {
      setPaying(false);
    }
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    handleProceedToPaymentMethod();
  };



  return (
    <section ref={ref} className="py-20 px-4 bg-black/30" id="pricing">
      <div className="container mx-auto max-w-6xl">
        <PricingHeader 
          showBuilderButton={showBuilderButton}
          onTestWebhook={handleTestWebhook}
          testing={testing}
        />

        {loading ? (
          <div className="text-center text-muted-foreground">Загрузка тарифов...</div>
        ) : (
          <>
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8 transition-all duration-300 ${
              showAllPlans ? 'max-h-none' : 'max-h-[600px] overflow-hidden'
            }`}>
              {plans.map((plan, i) => (
                <PricingCard
                  key={i}
                  plan={plan}
                  onSelect={handleOpenPaymentDialog}
                  paying={paying}
                />
              ))}
            </div>

            {plans.length > 3 && (
              <div className="text-center">
                <Button
                  onClick={() => setShowAllPlans(!showAllPlans)}
                  variant="outline"
                  size="lg"
                  className="min-w-[200px]"
                >
                  {showAllPlans ? 'Скрыть тарифы' : 'Показать все тарифы'}
                </Button>
              </div>
            )}
          </>
        )}

        <PaymentDialog
          show={showPaymentDialog}
          onClose={() => setShowPaymentDialog(false)}
          selectedPlan={selectedPlan}
          email={email}
          onEmailChange={setEmail}
          agreedToTerms={agreedToTerms}
          onAgreedToTermsChange={setAgreedToTerms}
          onSubmit={handlePayment}
          paying={paying}
        />

        <PaymentMethodDialog
          show={showPaymentMethodDialog}
          onClose={() => {
            setShowPaymentMethodDialog(false);
            setShowPaymentDialog(true);
          }}
          onSelectMethod={handleSelectPaymentMethod}
        />
      </div>
    </section>
  );
};

export default PricingSection;
