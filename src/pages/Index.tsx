import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PricingSection from "@/components/PricingSection";
import TrainingSection from "@/components/TrainingSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <div className="md:hidden">
        <PricingSection />
      </div>
      <div className="hidden md:block">
        <TrainingSection />
        <PricingSection />
      </div>
      <div className="md:hidden">
        <TrainingSection />
      </div>
      <FAQSection />
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Index;