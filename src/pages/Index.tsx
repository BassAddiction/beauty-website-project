import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { pageSEO, createOrganizationSchema } from "@/utils/seo";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PricingSection from "@/components/PricingSection";
import UseCasesSection from "@/components/UseCasesSection";
import FeaturesSection from "@/components/FeaturesSection";
import VPNClientsSection from "@/components/VPNClientsSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { NewsFeed } from "@/components/NewsFeed";
import { NewYearTheme } from "@/components/NewYearTheme";
import { InternalLinks } from "@/components/InternalLinks";

const Index = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const organizationSchema = createOrganizationSchema();
  
  useSEO({
    ...pageSEO.home,
    structuredData: organizationSchema
  });

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
      <NewYearTheme />
      <Header />
      <HeroSection />
      <div className="container mx-auto px-4">
        <NewsFeed />
      </div>
      <UseCasesSection />
      <VPNClientsSection />
      <PricingSection />
      <InternalLinks />
      <FeaturesSection />
      <FAQSection />
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Index;