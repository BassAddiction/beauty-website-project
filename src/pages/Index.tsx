import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/webapp/Header";
import HeroSection from "@/components/webapp/HeroSection";
import PricingSection from "@/components/webapp/PricingSection";
import FeaturesSection from "@/components/webapp/FeaturesSection";
import VPNClientsSection from "@/components/webapp/VPNClientsSection";
import TrainingSection from "@/components/webapp/TrainingSection";
import FAQSection from "@/components/webapp/FAQSection";
import Footer from "@/components/webapp/Footer";
import ScrollToTop from "@/components/webapp/ScrollToTop";

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