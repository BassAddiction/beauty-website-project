import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useSEO } from "@/hooks/useSEO";
import { pageSEO } from "@/utils/seo";
import Header from "@/components/Header";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { NewYearTheme } from "@/components/NewYearTheme";

const Register = () => {
  const [searchParams] = useSearchParams();
  
  useSEO(pageSEO.home);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const ref = searchParams.get('ref');
    if (ref) {
      localStorage.setItem('referral_code', ref);
    }
  }, [searchParams]);

  return (
    <>
      <Helmet>
        <title>Регистрация в Speed VPN — Выберите тариф</title>
        <meta name="description" content="Выберите тариф Speed VPN и получите мгновенный доступ к быстрому VPN. От 79₽ за неделю." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <NewYearTheme />
        <Header />
        
        <main className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Регистрация в Speed VPN
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Выберите тариф и создайте аккаунт
            </p>
          </div>

          <PricingSection />
        </main>

        <Footer />
        <ScrollToTop />
      </div>
    </>
  );
};

export default Register;
