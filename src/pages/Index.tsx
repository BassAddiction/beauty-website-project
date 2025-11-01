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
import { NewsFeed } from "@/components/NewsFeed";

const Index = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    // Save referral code from URL
    const ref = searchParams.get('ref');
    console.log('🎁 Referral code from URL on Index:', ref);
    if (ref) {
      localStorage.setItem('referral_code', ref);
      console.log('✅ Referral code saved on Index:', ref);
    }
    
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
      <div className="container mx-auto px-4">
        <NewsFeed />
      </div>
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