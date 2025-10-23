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
      <div className="flex flex-col">
        <div className="order-2 md:order-1">
          <TrainingSection />
        </div>
        <div className="order-1 md:order-2">
          <PricingSection />
        </div>
      </div>
      <FAQSection />
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Index;