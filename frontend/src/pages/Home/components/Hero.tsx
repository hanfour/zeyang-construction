import React, { useEffect, useState } from 'react';
import './Hero.css';

const Hero: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 初始化滾動位置
    setScrollY(window.scrollY || window.pageYOffset || 0);
    setIsReady(true);
    
    let ticking = false;
    
    const updateScrollY = () => {
      setScrollY(window.scrollY || window.pageYOffset || 0);
      ticking = false;
    };
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollY);
        ticking = true;
      }
    };

    // 確保頁面完全載入後再綁定事件
    const timer = setTimeout(() => {
      handleScroll(); // 立即執行一次更新
    }, 0);

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  return (
    <section className="relative w-full h-screen overflow-hidden">
      <div className="relative w-full h-full p-4">
        {/* Main container with padding */}
        <div className="relative w-full h-full flex overflow-hidden">
          {/* Hero Image Container - 90% width */}
          <div className="relative flex-1 h-full overflow-hidden">
            {/* Hero Image Wrapper */}
            <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-amber-100 to-amber-200">
              <div 
                className="absolute inset-0 w-[120%] h-[120%] -top-[10%] -left-[10%]"
                style={{
                  transform: isReady ? `translateY(${scrollY * 0.3}px)` : 'none',
                  willChange: 'transform',
                }}
              >
                <img 
                  src="/images/hero-bg.jpg" 
                  alt="澤暘建設主視覺" 
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              
              {/* Decorative elements - left side, only on image */}
              <div className="absolute left-0 top-0 h-full w-[49%] z-10 pointer-events-none">
                {/* First rectangle */}
                <div 
                  className="absolute -left-[90%] lg:-left-[45%] top-0 w-[200%] lg:w-[120%] h-full bg-primary opacity-50"
                  style={{ 
                    clipPath: 'polygon(35% 0, 100% 0, 65% 100%, 0 100%)',
                    mixBlendMode: 'multiply',
                    transform: isReady ? `translateY(${scrollY * 0.2}px)` : 'none',
                    willChange: 'transform',
                  }}
                />
                {/* Second rectangle */}
                <div 
                  className="absolute -left-[55%] lg:-left-[15%] top-0 w-[240%] lg:w-[120%] h-full bg-primary opacity-50"
                  style={{ 
                    clipPath: 'polygon(35% 0, 100% 0, 65% 100%, 0 100%)',
                    mixBlendMode: 'multiply',
                    transform: isReady ? `translateY(${scrollY * 0.15}px)` : 'none',
                    willChange: 'transform',
                  }}
                />
              </div>
              
              {/* Gradient overlay for better text visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              
              {/* Hero Content - Centered with Parallax */}
              <div className="absolute inset-0 flex items-center justify-center text-white z-20">
                <div 
                  className="text-center"
                  style={{
                    transform: isReady ? `translateY(${scrollY * 0.5}px)` : 'none',
                    willChange: 'transform',
                  }}
                >
                  <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-light tracking-[4px] sm:tracking-[6px] md:tracking-[8px] lg:tracking-[10px] mb-4 sm:mb-6 md:mb-8 drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
                    澤暘建設
                  </h1>
                  <p className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-[3px] sm:tracking-[4px] md:tracking-[6px] lg:tracking-[8px] opacity-90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
                    誠信築基・匠心營造
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Logo Container - 10% width */}
          <div className="relative w-[10%] h-full hidden lg:flex items-center justify-center bg-white">
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center logo-shine">
              <img 
                src="/images/logo-icon-brand.svg" 
                alt="澤暘建設 Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;