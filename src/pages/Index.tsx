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
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <PricingSection />
      <FeaturesSection />
      <VPNClientsSection />
      <TrainingSection />
      <FAQSection />
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Index;