import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PricingSection from "@/components/PricingSection";
import FeaturesSection from "@/components/FeaturesSection";
import VPNClientsSection from "@/components/VPNClientsSection";
import TrainingSection from "@/components/TrainingSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

const Index = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      const username = localStorage.getItem('vpn_username');
      const email = localStorage.getItem('vpn_email');
      
      toast({
        title: '✅ Оплата успешна!',
        description: `Подписка для ${username} активирована! Инструкция отправлена на ${email}`,
        duration: 10000
      });
      
      window.history.replaceState({}, '', '/');
    }
  }, [searchParams, toast]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <PricingSection />
      <FeaturesSection />
      <TrainingSection />
      <VPNClientsSection />
      <FAQSection />
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Index;