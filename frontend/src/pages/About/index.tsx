import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import PageBanner from '@/components/Layout/PageBanner';
import MenuButton from '@/components/Layout/MenuButton';
import NavigationMenu from '@/components/Layout/NavigationMenu';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// 數據結構
const aboutSections = {
  homeDreams: {
    title: "HOME OF DREAMS",
    subtitle: "誠信築基\n匠心營造",
    content: [
      "澤暘建設深耕土地多年\n30年來鐫刻無數大台北地標\n我們相信，好的住宅不僅是建築本身，\n更是生活價值的延伸與呈現。",
      "未來澤暘將持續以踏實的腳步前行，\n創造符合現代人需求、兼具舒適與美感的生活空間，\n讓建築經得起時光焠鍊，成就永恆地標之美，\n讓每一位住進「澤暘」的家人所見所感皆如所願\n建築質感、生活價值兼具，打從心底感到幸福"
    ],
    image: "/images/about/img-home.png"
  },
  president: {
    title: "PRESIDENT",
    subtitle: "澤暘建設\n江德成 總經理",
    verticalText: "將夢想建築化作現實中的動人詩篇\n只為實現心中的理想之作——\n到對建築由裡到外的細膩雕琢\n從對選地的嚴苛挑剔",
    experiences: [
      "保陽建設 總經理",
      "金樹機構 執行長", 
      "梅齡建設 副總經理",
      "江氏建設 創辦人之一兼執行副總"
    ],
    image: "/images/about/img-president.png",
    bottomImage: "/images/about/img-president2.png"
  },
  premium: {
    title: "PREMIUM STANDARD BUILDING",
    subtitle: "精工鍛造 × 機能尺度\n量化家的幸福",
    content: "澤暘的建築，講究的不只是格局，\n更是一種貼近生活的尺度美學\n精算迎光面的開窗角度、對材質的嚴格挑選、\n設計讓人更安心的耐震結構\n每一道細節都不是隨意，\n而是層層推敲後的選擇\n這些細緻入微的堅持，不只是對建築的用心\n更是澤暘對「理想生活」的信念與實踐",
    image: "/images/about/img-premium.png"
  },
  living: {
    title: "LIVING IN SUSTAINABLE HARMONY",
    subtitle: "便捷自然森活\n永續共好承諾",
    content: "以永續共好為使命\n結合智慧建築與綠建築技術\n優化能源管理與環境友善\n打造節能健康的生活空間\n讓每一位居住者都能感受到「共好」的溫度\n這不僅是一份責任\n更是澤暘對未來世代最真摯的承諾",
    smallImage: "/images/about/img-kids.png",
    largeImage: "/images/about/img-living.png"
  }
};

// 通用組件
const SectionHeader: React.FC<{
  title: string;
  subtitle: string;
  className?: string;
  textAlign?: 'left' | 'center' | 'right';
}> = ({ title, subtitle, className = "", textAlign = 'center' }) => (
  <div className={`space-y-4 lg:space-y-6 text-${textAlign} ${className}`}>
    <p className="text-primary-more text-content-mobile lg:text-content-desktop tracking-widest font-medium">
      {title}
    </p>
    <h2 className="text-main-large-title-mobile lg:text-main-large-title-desktop font-light text-black leading-tight">
      {subtitle.split('\n').map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < subtitle.split('\n').length - 1 && <br />}
        </React.Fragment>
      ))}
    </h2>
  </div>
);

const ContentText: React.FC<{
  content: string | string[];
  className?: string;
}> = ({ content, className = "" }) => (
  <div className={`space-y-6 text-content-mobile lg:text-content-desktop text-black leading-relaxed text-center lg:text-left ${className}`}>
    {Array.isArray(content) ? content.map((paragraph, i) => (
      <p key={i}>
        {paragraph.split('\n').map((line, j) => (
          <React.Fragment key={j}>
            {line}
            {j < paragraph.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>
    )) : (
      <p>
        {content.split('\n').map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < content.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>
    )}
  </div>
);


const AboutPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Animation refs
  const homeDreamsRef = useRef<HTMLElement>(null);
  const presidentRef = useRef<HTMLElement>(null);
  const premiumRef = useRef<HTMLElement>(null);
  const livingRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Initialize scroll animations
    const initScrollAnimations = () => {
      const mm = gsap.matchMedia();

      // Desktop animations
      mm.add("(min-width: 1024px)", () => {
        // Home Dreams Section Animation
        if (homeDreamsRef.current) {
          const titleElement = homeDreamsRef.current.querySelector('.section-title');
          const imageElement = homeDreamsRef.current.querySelector('.section-image');
          const imageImg = imageElement?.querySelector('img');
          const contentElement = homeDreamsRef.current.querySelector('.section-content');

          if (titleElement && imageElement && imageImg && contentElement) {
            gsap.set([titleElement, imageElement, contentElement], { opacity: 0, y: 50 });
            gsap.set(imageImg, { scale: 1.2 });

            ScrollTrigger.create({
              trigger: homeDreamsRef.current,
              start: 'top 80%',
              end: 'center center',
              scrub: 1,
              onUpdate: (self) => {
                const progress = self.progress;
                gsap.to(titleElement, {
                  opacity: Math.min(progress * 2, 1),
                  y: 50 * (1 - Math.min(progress * 2, 1)),
                  duration: 0.1
                });
                gsap.to(imageElement, {
                  opacity: Math.min((progress - 0.2) * 2, 1),
                  duration: 0.1
                });
                gsap.to(imageImg, {
                  scale: 1.2 - 0.2 * Math.min((progress - 0.2) * 2, 1),
                  duration: 0.1
                });
                gsap.to(contentElement, {
                  opacity: Math.min((progress - 0.4) * 2, 1),
                  y: 30 * (1 - Math.min((progress - 0.4) * 2, 1)),
                  duration: 0.1
                });
              }
            });
          }
        }

        // President Section Animation
        if (presidentRef.current) {
          const verticalText = presidentRef.current.querySelector('.vertical-text');
          const presidentInfo = presidentRef.current.querySelector('.president-info');
          const presidentImage = presidentRef.current.querySelector('.president-image');
          const presidentImg = presidentImage?.querySelector('img');
          const bottomImage = presidentRef.current.querySelector('.bottom-image');
          const bottomImg = bottomImage?.querySelector('img');

          if (verticalText && presidentInfo && presidentImage && presidentImg && bottomImage && bottomImg) {
            gsap.set([verticalText, presidentInfo, presidentImage, bottomImage], { opacity: 0 });
            gsap.set(presidentImage, { x: 50 });
            gsap.set(bottomImage, { y: 50 });
            gsap.set([presidentImg, bottomImg], { scale: 1.15 });

            ScrollTrigger.create({
              trigger: presidentRef.current,
              start: 'top 70%',
              end: 'bottom 30%',
              scrub: 1,
              onUpdate: (self) => {
                const progress = self.progress;
                
                gsap.to(verticalText, {
                  opacity: Math.min(progress * 2, 1),
                  duration: 0.1
                });
                gsap.to(presidentInfo, {
                  opacity: Math.min((progress - 0.2) * 2, 1),
                  duration: 0.1
                });
                gsap.to(presidentImage, {
                  opacity: Math.min((progress - 0.3) * 2, 1),
                  x: 50 * (1 - Math.min((progress - 0.3) * 2, 1)),
                  duration: 0.1
                });
                gsap.to(presidentImg, {
                  scale: 1.15 - 0.15 * Math.min((progress - 0.3) * 2, 1),
                  duration: 0.1
                });
                gsap.to(bottomImage, {
                  opacity: Math.min((progress - 0.5) * 2, 1),
                  y: 50 * (1 - Math.min((progress - 0.5) * 2, 1)),
                  duration: 0.1
                });
                gsap.to(bottomImg, {
                  scale: 1.15 - 0.15 * Math.min((progress - 0.5) * 2, 1),
                  duration: 0.1
                });
              }
            });
          }
        }

        // Premium Section Animation
        if (premiumRef.current) {
          const headerElement = premiumRef.current.querySelector('.premium-header');
          const imageElement = premiumRef.current.querySelector('.premium-image');
          const overlayContent = premiumRef.current.querySelector('.overlay-content');

          if (headerElement && imageElement && overlayContent) {
            gsap.set(headerElement, { opacity: 0, y: -30 });
            gsap.set(imageElement, { scale: 1.2, opacity: 0 });
            gsap.set(overlayContent, { opacity: 0, x: -50 });

            ScrollTrigger.create({
              trigger: premiumRef.current,
              start: 'top 60%',
              end: 'bottom 40%',
              scrub: 1,
              onUpdate: (self) => {
                const progress = self.progress;
                
                // Enhanced animation with proper timing
                const headerProgress = Math.min(progress * 2.5, 1);
                const imageProgress = Math.max(0, Math.min((progress - 0.1) * 2, 1));
                const overlayProgress = Math.max(0, Math.min((progress - 0.3) * 1.67, 1));
                
                gsap.set(headerElement, {
                  opacity: headerProgress,
                  y: -30 * (1 - headerProgress)
                });
                gsap.set(imageElement, {
                  opacity: imageProgress,
                  scale: 1.2 - 0.2 * imageProgress
                });
                gsap.set(overlayContent, {
                  opacity: overlayProgress * 0.8,
                  x: -50 * (1 - overlayProgress)
                });
              }
            });
          }
        }

        // Living Section Animation
        if (livingRef.current) {
          const headerElement = livingRef.current.querySelector('.living-header');
          const contentElement = livingRef.current.querySelector('.living-content');
          const smallImage = livingRef.current.querySelector('.small-image');
          const smallImg = smallImage?.querySelector('img');
          const largeImage = livingRef.current.querySelector('.large-image');
          const largeImg = largeImage?.querySelector('img');


          if (headerElement && contentElement && smallImage && smallImg && largeImage && largeImg) {
            gsap.set([headerElement, contentElement], { opacity: 0, y: 30 });
            gsap.set(smallImage, { opacity: 0 });
            gsap.set(smallImg, { scale: 1.2 });
            gsap.set(largeImage, { opacity: 0, x: 100 });
            gsap.set(largeImg, { scale: 1.15 });

            ScrollTrigger.create({
              trigger: livingRef.current,
              start: 'top 60%',
              end: 'bottom 40%',
              scrub: 1,
              onUpdate: (self) => {
                const progress = self.progress;
                
                // Enhanced animation with proper timing
                const headerProgress = Math.min(progress * 2.5, 1);
                const contentProgress = Math.max(0, Math.min((progress - 0.1) * 2, 1));
                const smallImageProgress = Math.max(0, Math.min((progress - 0.2) * 1.67, 1));
                const largeImageProgress = Math.max(0, Math.min((progress - 0.15) * 1.82, 1));
                
                gsap.set(headerElement, {
                  opacity: headerProgress,
                  y: 30 * (1 - headerProgress)
                });
                gsap.set(contentElement, {
                  opacity: contentProgress,
                  y: 30 * (1 - contentProgress)
                });
                gsap.set(smallImage, {
                  opacity: smallImageProgress
                });
                gsap.set(smallImg, {
                  scale: 1.2 - 0.2 * smallImageProgress
                });
                gsap.set(largeImage, {
                  opacity: largeImageProgress,
                  x: 100 * (1 - largeImageProgress)
                });
                gsap.set(largeImg, {
                  scale: 1.15 - 0.15 * largeImageProgress
                });
              }
            });
          }
        }
      });

      // Mobile animations - simpler fade-in effects with image zoom
      mm.add("(max-width: 1023px)", () => {
        [homeDreamsRef, presidentRef, premiumRef, livingRef].forEach(ref => {
          if (ref.current) {
            const elements = ref.current.querySelectorAll('.animate-on-scroll');
            
            elements.forEach((element, index) => {
              const img = element.querySelector('img');
              
              gsap.set(element, { opacity: 0, y: 30 });
              if (img) {
                gsap.set(img, { scale: 1.15 });
              }
              
              ScrollTrigger.create({
                trigger: element,
                start: 'top 90%',
                end: 'top 60%',
                scrub: 1,
                onUpdate: (self) => {
                  gsap.to(element, {
                    opacity: self.progress,
                    y: 30 * (1 - self.progress),
                    duration: 0.1
                  });
                  
                  if (img) {
                    gsap.to(img, {
                      scale: 1.15 - 0.15 * self.progress,
                      duration: 0.1
                    });
                  }
                }
              });
            });
          }
        });
      });

      return () => {
        mm.revert();
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      };
    };

    const cleanup = initScrollAnimations();
    
    return cleanup;
  }, []);

  const BANNER_HEIGHT = 288;

  const bannerConfig = {
    logoSection: {
      iconSrc: "/images/logo-icon-brand.svg",
      iconAlt: "澤暘建設",
      subtitle: "ABOUT ZY",
      title: "關於澤暘 "
    },
    centralContent: {
      text: "築的不只是房子，更是一種生活價值\nWe craft more than homes We create a way of living."
    },
    backgroundImage: "/images/about/top-bn-about.png"
  };

  return (
    <>
      <Helmet>
        <title>關於澤暘 - 澤暘建設</title>
        <meta name="description" content="築的不只是房子，更是一種生活價值" />
      </Helmet>

      {/* Hero Section */}
      <PageBanner config={bannerConfig}>
        {/* Menu Button */}
        <MenuButton 
          isOpen={isMenuOpen} 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          color={scrollY > BANNER_HEIGHT ? 'dark' : 'light'}
        />
        
        {/* Navigation Menu */}
        <NavigationMenu 
          isOpen={isMenuOpen} 
          onClose={() => setIsMenuOpen(false)} 
        />
      </PageBanner>

      {/* HOME OF DREAMS Section */}
      <section ref={homeDreamsRef} className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:grid lg:grid-cols-7 gap-8 lg:gap-12">
            {/* Left Column - Title (Bottom Aligned on desktop) */}
            <div className="order-1 lg:order-1 lg:col-span-2 flex flex-col justify-center lg:justify-end">
              <div className="flex justify-center lg:justify-end">
                <div className="flex flex-col items-center lg:items-start section-title animate-on-scroll">
                  <SectionHeader 
                    title={aboutSections.homeDreams.title}
                    subtitle={aboutSections.homeDreams.subtitle}
                    textAlign="center"
                    className="lg:text-left"
                  />
                </div>
              </div>
            </div>
            
            {/* Middle Column - Image */}
            <div className="order-2 lg:order-2 lg:col-span-3 flex items-center section-image animate-on-scroll overflow-hidden">
              <img 
                src={aboutSections.homeDreams.image}
                alt="澤暘建設 - 誠信築基 匠心營造"
                className="w-full h-auto object-cover object-bottom max-h-[360px] lg:max-h-none"
              />
            </div>
            
            {/* Right Column - Content (Top Aligned on desktop) */}
            <div className="order-3 lg:order-3 lg:col-span-2 flex flex-col justify-center lg:justify-start section-content animate-on-scroll">
              <ContentText content={aboutSections.homeDreams.content} />
            </div>
          </div>
        </div>
      </section>

      {/* PRESIDENT Section */}
      <section ref={presidentRef} className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6 xl:px-36 2xl:px-72">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-end">
            {/* Left Column - Text Content with Image */}
            <div className="order-3 lg:order-1 w-full flex flex-col justify-end flex-1 lg:translate-y-24">
              <div className="space-y-6 flex flex-row lg:flex-col">
                {/* Vertical Text Content */}
                <div className="order-last lg:order-first flex-1 flex justify-center space-x-4 text-black leading-relaxed text-content-mobile lg:text-content-desktop lg:translate-y-16 vertical-text animate-on-scroll z-20">
                  <p style={{ writingMode: 'vertical-rl' }}>
                    {aboutSections.president.verticalText.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < aboutSections.president.verticalText.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </p>
                </div>
                
                {/* Bottom Image */}
                <div className="bottom-image animate-on-scroll">
                  <img 
                    src={aboutSections.president.bottomImage}
                    alt="建築設計"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
            
            {/* Middle Column - President Info */}
            <div className="order-1 lg:order-2 flex flex-col justify-center flex-shrink-0 president-info animate-on-scroll">
              <div className="text-left space-y-8">
                <div className="space-y-4">
                  <p className="text-center lg:text-right text-primary-more text-content-mobile lg:text-content-desktop tracking-widest font-medium">
                    {aboutSections.president.title}
                  </p>
                  <div className='flex flex-col space-y-2 font-normal text-black leading-tight'>
                    <h2 className="text-main-large-title-mobile lg:text-main-large-title-desktop" style={{ textAlignLast: 'justify' }}>
                      澤暘建設
                    </h2>
                    <p className="text-sub-title-mobile lg:text-sub-title-desktop" style={{ textAlignLast: 'justify' }}>江德成 總經理</p>
                  </div>
                </div>
                
                <div className="space-y-3 text-content-mobile lg:text-content-desktop text-black leading-relaxed">
                  {aboutSections.president.experiences.map((exp, i) => (
                    <p key={i} className="flex items-center justify-center lg:justify-start">
                      <span className="w-2 h-2 bg-primary-more rounded-full mr-3"></span>
                      {exp}
                    </p>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Right Column - President Photo */}
            <div className="order-2 lg:order-3 flex flex-col justify-start flex-1 lg:-translate-y-24 president-image animate-on-scroll">
              <img 
                src={aboutSections.president.image}
                alt="澤暘建設 江德成 總經理"
                className="w-full h-auto object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>

      {/* PREMIUM STANDARD BUILDING Section */}
      <section ref={premiumRef} className="relative py-16 md:py-24 lg:py-0 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:block space-y-8 lg:space-y-0">
            {/* Header - Mobile center, Desktop right with overlay */}
            <div className="lg:flex lg:justify-end lg:mb-4">
              <div className="lg:translate-y-20 lg:z-10 lg:relative lg:p-8 premium-header animate-on-scroll">
                <SectionHeader 
                  title={aboutSections.premium.title}
                  subtitle={aboutSections.premium.subtitle}
                  textAlign="center"
                  className="lg:text-right"
                />
              </div>
            </div>
            
            {/* Image with overlay text */}
            <div className="relative overflow-hidden">
              <img 
                src={aboutSections.premium.image}
                alt="精工鍛造 × 機能尺度 量化家的幸福"
                className="w-full h-auto object-cover premium-image"
              />
              
              {/* Content Text - Mobile below image, Desktop overlay on left */}
              <div className="lg:absolute lg:inset-y-0 lg:flex lg:items-center lg:left-0 overlay-content animate-on-scroll">
                <div className="mt-8 lg:mt-0 lg:max-w-lg">
                  <ContentText 
                    content={aboutSections.premium.content}
                    className="lg:text-white lg:p-8 lg:text-shadow-dark text-center lg:text-left"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVING IN SUSTAINABLE HARMONY Section */}
      <section ref={livingRef} className="py-16 md:py-24 bg-white">
        {/* Mobile Layout */}
        <div className="lg:hidden container mx-auto px-6">
          <div className="space-y-12">
            {/* Header */}
            <div className="animate-on-scroll">
              <SectionHeader 
                title={aboutSections.living.title}
                subtitle={aboutSections.living.subtitle}
                textAlign="center"
              />
            </div>
            
            {/* Content */}
            <div className="space-y-8">
              {/* Text Content */}
              <div className="animate-on-scroll">
                <ContentText content={aboutSections.living.content} />
              </div>
              
              {/* Images */}
              <div className="space-y-6">
                <div className="w-[85%] animate-on-scroll">
                  <img 
                    src={aboutSections.living.smallImage}
                    alt="孩童玩樂"
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className='-translate-y-12 w-[85%] ms-[15%] animate-on-scroll'>
                  <img 
                    src={aboutSections.living.largeImage}
                    alt="自然森活環境"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-6 gap-0">
            {/* Empty Column */}
            <div className="col-span-1"></div>
            
            {/* Text Content Columns */}
            <div className="col-span-2 pr-8 xl:pr-12 flex flex-col justify-center min-h-[600px]">
              <div className="space-y-8 transform translate-y-8">
                {/* Header */}
                <div className="living-header">
                  <SectionHeader 
                    title={aboutSections.living.title}
                    subtitle={aboutSections.living.subtitle}
                    textAlign="left"
                  />
                </div>
                
                {/* Text Content */}
                <div className="living-content">
                  <ContentText content={aboutSections.living.content} />
                </div>
                
                {/* Small Image */}
                <div className="mt-8 small-image overflow-hidden">
                  <img 
                    src={aboutSections.living.smallImage}
                    alt="孩童玩樂"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
            
            {/* Large Image Columns - Flush to right edge */}
            <div className="col-span-3 -translate-y-8 large-image overflow-hidden">
              <img 
                src={aboutSections.living.largeImage}
                alt="自然森活環境"
                className="w-full h-full object-cover"
                style={{ minHeight: '600px' }}
              />
            </div>
          </div>
        </div>
      </section>

    </>
  );
};

export default AboutPage;