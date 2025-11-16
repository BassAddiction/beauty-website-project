import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const UseCasesSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const useCases = [
    {
      title: "Speedtest без ограничений",
      description: "Проверяйте реальную скорость интернета через VPN",
      image: "https://cdn.poehali.dev/files/eac0cd28-0e10-45e1-85aa-8d4273bff5d6.jpg",
      alt: "Speedtest через Speed VPN показывает высокую скорость 217 Мбит/с"
    },
    {
      title: "YouTube без рекламы",
      description: "Смотрите видео на YouTube без блокировок и ограничений",
      image: "https://cdn.poehali.dev/files/62e95f56-1346-41d3-998a-92daee3b5bf1.jpg",
      alt: "YouTube работает через Speed VPN без рекламы и блокировок"
    },
    {
      title: "ChatGPT и другие AI-сервисы",
      description: "Доступ к ChatGPT, Midjourney и другим заблокированным сервисам",
      image: "https://cdn.poehali.dev/files/12749d3f-7c65-4842-96d5-662879dca06a.jpg",
      alt: "ChatGPT доступен через Speed VPN из России"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % useCases.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + useCases.length) % useCases.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentSlide]);

  return (
    <section ref={ref} className="py-20 px-4 bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
          Выберите VPN-решение под ваши задачи
        </h2>
        <p className="text-center text-muted-foreground mb-12 text-lg">
          Speed VPN работает со всеми популярными сервисами
        </p>
        
        {/* Desktop Grid */}
        <div className={`hidden md:grid md:grid-cols-3 gap-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {useCases.map((useCase, index) => (
            <div 
              key={index}
              className="group relative overflow-hidden rounded-2xl border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              <div className="aspect-[9/16] relative overflow-hidden bg-gradient-to-br from-primary/20 to-purple-600/20">
                <img 
                  src={useCase.image} 
                  alt={useCase.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">
                    {useCase.title}
                  </h3>
                  <p className="text-sm text-gray-200 opacity-90 mb-4">
                    {useCase.description}
                  </p>
                  <Link 
                    to="/#pricing"
                    className="inline-block w-full text-center px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-semibold text-sm shadow-lg"
                  >
                    Попробовать
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className={`md:hidden relative transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div 
            className="relative overflow-hidden rounded-2xl"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {useCases.map((useCase, index) => (
                <div 
                  key={index}
                  className="w-full flex-shrink-0"
                >
                  <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 to-purple-600/20 aspect-[9/16]">
                    <img 
                      src={useCase.image} 
                      alt={useCase.alt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-2xl font-bold mb-2">
                        {useCase.title}
                      </h3>
                      <p className="text-sm text-gray-200 opacity-90 mb-4">
                        {useCase.description}
                      </p>
                      <Link 
                        to="/#pricing"
                        className="inline-block w-full text-center px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-semibold shadow-lg"
                      >
                        Попробовать
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all z-10"
              aria-label="Previous slide"
            >
              <Icon name="ChevronLeft" size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all z-10"
              aria-label="Next slide"
            >
              <Icon name="ChevronRight" size={24} />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {useCases.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentSlide === index 
                    ? 'bg-primary w-8' 
                    : 'bg-muted-foreground/30'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;