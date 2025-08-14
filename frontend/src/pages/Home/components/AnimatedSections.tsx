import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// 統一管理的內容數據
const sectionData = {
  dream: {
    title: '築夢。',
    subtitle: '築一座能安放幸福的家',
    content: [
      '建築的起點，從一磚一瓦開始，用心描繪出對未來的想像',
      '從晨光灑落的餐桌，到深夜仍亮著的燈火',
      '從家人間的歡聲笑語，到細水長流的溫馨',
      '家的模樣，就是幸福的真實模樣'
    ],
    image: '/images/index/quote-dream.jpg',
    imageAlt: '築夢背景',
    imagePosition: '85%_100%'
  },
  craft: {
    title: '精工。',
    subtitle: '品質不是口號，而是實實在在的堅持',
    content: [
      '真正的好，是無需多說的',
      '我們融合傳統工藝與現代技術',
      '用時間雕琢、用專業驗證',
      '磨練出澤暘建築',
      '都是品質的最好證明'
    ],
    image: '/images/index/quote-fine.jpg',
    imageAlt: '精工',
    imagePosition: '100%_100%'
  },
  sustain: {
    title: '永續。',
    subtitle: '不是為了今天，而是為了更好的明天',
    content: [
      '用一座綠建築，善待土地，善待未來',
      '光影流動的窗、呼吸自然氣息的牆',
      '讓自然與家同框，森活與未來共生',
      '永續，不是一種趨勢，而是一種選擇',
      '讓家更舒適宜居，讓日子學會深呼吸'
    ],
    image: '/images/index/quote-green.jpg',
    imageAlt: '永續',
    imagePosition: 'center'
  },
  classic: {
    title: '經典。',
    subtitle: '所謂雋永，是一種動人的生活體驗',
    content: [
      '經典，從不僅是建築的模樣',
      '而是它細膩譜寫的生活詩篇',
      '從居住體驗到情感連結',
      '透過我們雕琢的每一個建築細節',
      '讓美與實用兼得的',
      '在時光中淬鍊雋永人生感動'
    ],
    image: '/images/index/quote-classic.jpg',
    imageAlt: '經典',
    imagePosition: '100%_100%'
  }
};

const AnimatedSections: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 桌機版 refs
  const dreamSectionDesktopRef = useRef<HTMLDivElement>(null);
  const dreamContentDesktopRef = useRef<HTMLDivElement>(null);
  const dreamBgDesktopRef = useRef<HTMLDivElement>(null);
  const craftSectionDesktopRef = useRef<HTMLDivElement>(null);
  const sustainSectionDesktopRef = useRef<HTMLDivElement>(null);
  const classicSectionDesktopRef = useRef<HTMLDivElement>(null);
  const classicImageDesktopRef = useRef<HTMLImageElement>(null);
  const classicLeftTextDesktopRef = useRef<HTMLDivElement>(null);
  const classicRightTextDesktopRef = useRef<HTMLDivElement>(null);
  
  // 手機版 refs
  const dreamSectionMobileRef = useRef<HTMLDivElement>(null);
  const dreamContentMobileRef = useRef<HTMLDivElement>(null);
  const dreamBgMobileRef = useRef<HTMLDivElement>(null);
  const craftSectionMobileRef = useRef<HTMLDivElement>(null);
  const sustainSectionMobileRef = useRef<HTMLDivElement>(null);
  const classicSectionMobileRef = useRef<HTMLDivElement>(null);
  const classicImageMobileRef = useRef<HTMLImageElement>(null);
  const classicLeftTextMobileRef = useRef<HTMLDivElement>(null);
  const classicRightTextMobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    
    if (!container) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const dreamSection = dreamSectionDesktopRef.current;
      const dreamContent = dreamContentDesktopRef.current;
      const dreamBg = dreamBgDesktopRef.current;
      const craftSection = craftSectionDesktopRef.current;
      const sustainSection = sustainSectionDesktopRef.current;
      const classicSection = classicSectionDesktopRef.current;
      const classicImage = classicImageDesktopRef.current;
      const classicLeftText = classicLeftTextDesktopRef.current;
      const classicRightText = classicRightTextDesktopRef.current;
      
      if (!dreamSection || !dreamContent || !dreamBg || 
          !craftSection || !sustainSection || !classicSection || 
          !classicImage || !classicLeftText || !classicRightText) return;
      
      // 主時間軸
      const mainTl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: '+=500%',
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        }
      });

      // 初始設置
      gsap.set(craftSection, {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '50%',
        height: '100%',
        y: '-100%',
        opacity: 0
      });

      gsap.set(sustainSection, {
        position: 'absolute',
        right: 0,
        top: 0,
        width: '50%',
        height: '100%',
        y: '100%',
        opacity: 0
      });

      gsap.set(classicSection, {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0
      });

      gsap.set(classicImage, {
        scale: 0.33
      });

      gsap.set([classicLeftText, classicRightText], {
        opacity: 0
      });

      // 階段 1: 築夢文字淡出
      mainTl.to(dreamContent, {
        y: -100,
        opacity: 0,
        duration: 1,
        ease: "power2.inOut"
      }, 0);

      // 階段 2: 築夢背景左移
      mainTl.to(dreamBg, {
        x: '-50%',
        width: '100%',
        duration: 1.5,
        ease: "power2.inOut"
      }, 0.5);

      // 階段 3: 精工由上往下覆蓋左側
      mainTl.to(craftSection, {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power2.out"
      }, 1.5);

      // 同時永續由下往上出現在右側
      mainTl.to(sustainSection, {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power2.out"
      }, 1.8);

      // 階段 4: 淡出精工和永續，顯示經典
      mainTl.to([craftSection, sustainSection, dreamBg], {
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut"
      }, 3.5);

      mainTl.to(classicSection, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.inOut"
      }, 3.8);

      // 階段 5: 經典圖片放大
      mainTl.to(classicImage, {
        scale: 1,
        duration: 1.5,
        ease: "power2.out"
      }, 4.2);

      // 左下角文字淡入
      mainTl.to(classicLeftText, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out"
      }, 4.5);

      // 右上角文字淡入
      mainTl.to(classicRightText, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out"
      }, 4.8);

      return () => {
        mainTl.kill();
      };
    });

    mm.add("(max-width: 767px)", () => {
      // 移動版：各區塊獨立動畫
      const dreamSection = dreamSectionMobileRef.current;
      const dreamContent = dreamContentMobileRef.current;
      const craftSection = craftSectionMobileRef.current;
      const sustainSection = sustainSectionMobileRef.current;
      const classicSection = classicSectionMobileRef.current;
      const classicImage = classicImageMobileRef.current;
      const classicLeftText = classicLeftTextMobileRef.current;
      const classicRightText = classicRightTextMobileRef.current;
      
      if (!dreamSection || !dreamContent || !craftSection || !sustainSection || 
          !classicSection || !classicImage || !classicLeftText || !classicRightText) return;
      
      // 築夢區塊 - 文字向上消失
      gsap.timeline({
        scrollTrigger: {
          trigger: dreamSection,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          pin: true,
          pinSpacing: false,
        }
      })
      .to(dreamContent, {
        y: -150,
        opacity: 0,
        duration: 1,
        ease: "power2.inOut"
      });

      // 精工區塊 - 文字淡入
      const craftContent = craftSection.querySelector('.craft-content');
      if (craftContent) {
        gsap.set(craftContent, { opacity: 0, y: 50 });
        
        ScrollTrigger.create({
          trigger: craftSection,
          start: 'top 80%',
          end: 'center center',
          scrub: 1,
          onUpdate: (self) => {
            gsap.to(craftContent, {
              opacity: self.progress,
              y: 50 * (1 - self.progress),
              duration: 0.1,
              ease: "none"
            });
          }
        });
      }

      // 永續區塊 - 圖片向上浮出
      const sustainImage = sustainSection.querySelector('.sustain-image');
      if (sustainImage) {
        gsap.set(sustainImage, { y: '100%' });
        
        ScrollTrigger.create({
          trigger: sustainSection,
          start: 'top 60%',
          end: 'center center',
          scrub: 1,
          onUpdate: (self) => {
            gsap.to(sustainImage, {
              y: `${100 * (1 - self.progress)}%`,
              duration: 0.1,
              ease: "none"
            });
          }
        });
      }

      // 經典區塊 - 複雜動畫
      // 初始設置
      gsap.set(classicImage, { scale: 0.7 });
      gsap.set(classicLeftText, { opacity: 1, y: 0 });
      gsap.set(classicRightText, { opacity: 0, y: 50 });
      
      ScrollTrigger.create({
        trigger: classicSection,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          
          // 文字區塊向上移動（前半段動畫）
          if (progress < 0.5) {
            gsap.to(classicLeftText, {
              y: -200 * (progress * 2),
              duration: 0.1,
              ease: "none"
            });
          }
          
          // 圖片放大（全程動畫）
          gsap.to(classicImage, {
            scale: 0.7 + (0.3 * progress),
            duration: 0.1,
            ease: "none"
          });
          
          // 右上角文字淡入（後半段動畫）
          if (progress > 0.5) {
            const fadeProgress = (progress - 0.5) * 2;
            gsap.to(classicRightText, {
              opacity: fadeProgress,
              y: 50 * (1 - fadeProgress),
              duration: 0.1,
              ease: "none"
            });
          }
        }
      });
    });

    return () => {
      mm.revert();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <>
      {/* 桌機版：使用固定容器 */}
      <div className="hidden md:block w-full pb-24">
        <div ref={containerRef} className="relative w-full h-screen overflow-hidden">
          {/* 築夢區塊 */}
          <div ref={dreamSectionDesktopRef} className="section-dream absolute inset-0">
            <div ref={dreamBgDesktopRef} className="absolute inset-0 w-full h-full">
              <img 
                src={sectionData.dream.image}
                alt={sectionData.dream.imageAlt}
                className={`w-full h-full object-cover object-[${sectionData.dream.imagePosition}]`}
              />
            </div>
            <div ref={dreamContentDesktopRef} className="relative h-full flex items-center justify-center z-10">
              <div className="flex items-center -ml-12">
                {/* 左側垂直文字 */}
                <div className="flex-shrink-0 mr-16 -translate-y-9">
                  <h1 className="text-main-large-title-mobile lg:text-main-large-title-desktop font-bold text-white [writing-mode:vertical-rl] [text-orientation:upright]">
                    {sectionData.dream.title}
                  </h1>
                </div>
                
                {/* 右側水平文字區塊 */}
                <div className="flex-1 max-w-3xl">
                  <h2 className="text-sub-title-mobile lg:text-sub-title-desktop font-bold text-white mb-8">
                    {sectionData.dream.subtitle}
                  </h2>
                  <div className="text-content-mobile lg:text-content-desktop text-white leading-relaxed">
                    {sectionData.dream.content.map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        {index < sectionData.dream.content.length - 1 && <br/>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 精工區塊 */}
          <div ref={craftSectionDesktopRef} className="section-craft absolute left-0 top-0 w-1/2 h-full">
            <div className="relative w-full h-full bg-white pb-32">
              <img 
                src={sectionData.craft.image}
                alt={sectionData.craft.imageAlt}
                className={`w-full h-full object-cover object-[${sectionData.craft.imagePosition}]`}
              />
              <div className="absolute inset-0 flex items-center justify-center z-10 px-8">
                <div className="flex items-center">
                  {/* 左側垂直文字 */}
                  <div className="flex-shrink-0 mr-12" style={{ transform: 'translateY(-10em)' }}>
                    <h1 className="text-main-large-title-mobile lg:text-main-large-title-desktop font-bold text-black [writing-mode:vertical-rl] [text-orientation:upright]">
                      {sectionData.craft.title}
                    </h1>
                  </div>
                  
                  {/* 右側水平文字區塊 */}
                  <div className="flex-1 max-w-lg">
                    <h2 className="text-sub-title-mobile lg:text-sub-title-desktop font-bold text-black mb-6">
                      {sectionData.craft.subtitle}
                    </h2>
                    <div className="text-content-mobile lg:text-content-desktop text-black leading-relaxed">
                      {sectionData.craft.content.map((line, index) => (
                        <React.Fragment key={index}>
                          {line}
                          {index < sectionData.craft.content.length - 1 && <br/>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 永續區塊 */}
          <div ref={sustainSectionDesktopRef} className="section-sustain absolute right-0 top-0 w-1/2 h-full pb-4">
            <div className="relative w-full h-full flex flex-col items-center justify-end gap-12">
              <div className="text-center px-8 max-w-lg">
                <h2 className="text-main-large-title-mobile lg:text-main-large-title-desktop font-bold text-black mb-8">
                  {sectionData.sustain.title}
                </h2>
                <h3 className="text-sub-title-mobile lg:text-sub-title-desktop font-bold text-black mb-6">
                  {sectionData.sustain.subtitle}
                </h3>
                <div className="text-content-mobile lg:text-content-desktop text-black leading-relaxed">
                  {sectionData.sustain.content.map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      {index < sectionData.sustain.content.length - 1 && <br/>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div className="relative overflow-hidden flex justify-center items-center">
                  <div className="sustain-image relative inset-0 w-full max-w-[50%] aspect-video">
                    <img 
                      src={sectionData.sustain.image}
                      alt={sectionData.sustain.imageAlt}
                      className="w-full object-cover"
                    />
                  </div>
                </div>
            </div>
          </div>

          {/* 經典區塊 */}
          <div ref={classicSectionDesktopRef} className="section-classic absolute inset-0">
            <div className="relative w-full h-full bg-white overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  ref={classicImageDesktopRef}
                  src={sectionData.classic.image}
                  alt={sectionData.classic.imageAlt}
                  className={`w-11/12 h-11/12 object-cover object-[${sectionData.classic.imagePosition}]`}
                />
              </div>
              <div ref={classicLeftTextDesktopRef} className="absolute bottom-10 left-10 text-black">
                <h2 className="text-main-large-title-mobile lg:text-main-large-title-desktop font-bold text-black mb-8">
                  {sectionData.classic.title}
                </h2>
                <h3 className="text-sub-title-mobile lg:text-sub-title-desktop font-bold text-black mb-6">
                  {sectionData.classic.subtitle}
                </h3>
              </div>
              <div ref={classicRightTextDesktopRef} className="absolute top-32 right-48 text-black text-left">
                <div className="text-content-mobile lg:text-content-desktop text-white text-shadow-sm leading-relaxed">
                  {sectionData.classic.content.map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      {index < sectionData.classic.content.length - 1 && <br/>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 手機版：獨立區塊 */}
      <div className="md:hidden w-full pb-16">
        {/* 築夢區塊 */}
        <div ref={dreamSectionMobileRef} className="section-dream relative h-screen">
          <div ref={dreamBgMobileRef} className="absolute inset-0 w-full h-full">
            <img 
              src={sectionData.dream.image}
              alt={sectionData.dream.imageAlt}
              className={`w-full h-full object-cover object-[${sectionData.dream.imagePosition}]`}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 to-amber-100/30" />
          </div>
          <div ref={dreamContentMobileRef} className="relative h-full flex items-center justify-center z-10 px-6">
            <div className="flex items-center">
              {/* 左側垂直文字 */}
              <div className="flex-shrink-0 mr-8" style={{ transform: 'translateY(-2em)' }}>
                <h1 className="text-main-large-title-mobile font-bold text-white drop-shadow-lg [writing-mode:vertical-rl] [text-orientation:upright]">
                  {sectionData.dream.title}
                </h1>
              </div>
              
              {/* 右側水平文字區塊 */}
              <div className="flex-1">
                <h2 className="text-sub-title-mobile font-bold text-white mb-6 drop-shadow-lg">
                  {sectionData.dream.subtitle}
                </h2>
                <div className="text-content-mobile text-white leading-relaxed drop-shadow-lg">
                  {sectionData.dream.content.map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      {index < sectionData.dream.content.length - 1 && <br/>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 精工區塊 */}
        <div ref={craftSectionMobileRef} className="section-craft relative h-screen">
          <div className="relative w-full h-full bg-gray-100">
            <img 
              src={sectionData.craft.image}
              alt={sectionData.craft.imageAlt}
              className={`w-full h-full object-cover object-[${sectionData.craft.imagePosition}]`}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200/60 to-gray-300/60" />
            <div className="absolute inset-0 flex items-center justify-center px-6">
              <div className="flex items-center">
                {/* 左側垂直文字 */}
                <div className="flex-shrink-0 mr-6" style={{ transform: 'translateY(-5em)' }}>
                  <h1 className="text-main-large-title-mobile font-bold text-black [writing-mode:vertical-rl] [text-orientation:upright]">
                    {sectionData.craft.title}
                  </h1>
                </div>
                
                {/* 右側水平文字區塊 */}
                <div className="flex-1">
                  <h2 className="text-sub-title-mobile font-bold text-black mb-4">
                    {sectionData.craft.subtitle}
                  </h2>
                  <div className="text-content-mobile text-black leading-relaxed">
                    {sectionData.craft.content.map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        {index < sectionData.craft.content.length - 1 && <br/>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 永續區塊 */}
        <div ref={sustainSectionMobileRef} className="section-sustain relative h-screen bg-green-50">
          <div className="relative w-full h-full flex flex-col items-center justify-center px-6 gap-12">
            <div className="text-center">
              <h2 className="text-main-large-title-mobile font-bold text-black mb-6">
                {sectionData.sustain.title}
              </h2>
              <h3 className="text-sub-title-mobile font-bold text-black mb-4">
                {sectionData.sustain.subtitle}
              </h3>
              <div className="text-content-mobile text-black leading-relaxed">
                {sectionData.sustain.content.map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    {index < sectionData.sustain.content.length - 1 && <br/>}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="w-full h-1/2 relative overflow-hidden">
              <div className="sustain-image absolute inset-0 w-full h-full">
                <img 
                  src={sectionData.sustain.image}
                  alt={sectionData.sustain.imageAlt}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 經典區塊 */}
        <div ref={classicSectionMobileRef} className="section-classic relative h-screen">
          <div className="relative w-full h-full overflow-hidden">
            <div className="absolute inset-0">
              <img 
                ref={classicImageMobileRef}
                src={sectionData.classic.image}
                alt={sectionData.classic.imageAlt}
                className="w-full h-full object-cover object-[62%_100%]"
              />
            </div>
            <div ref={classicLeftTextMobileRef} className="absolute inset-0 flex items-center justify-center text-black z-10">
              <div className="text-center px-6">
                <h2 className="text-main-large-title-mobile font-bold text-black mb-8">
                  {sectionData.classic.title}
                </h2>
                <h3 className="text-sub-title-mobile font-bold text-black mb-6">
                  {sectionData.classic.subtitle}
                </h3>
              </div>
            </div>
            <div ref={classicRightTextMobileRef} className="absolute bottom-10 left-0 right-0 text-black text-center z-10 px-6">
              <div className="text-content-mobile text-black leading-relaxed">
                {sectionData.classic.content.map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    {index < sectionData.classic.content.length - 1 && <br/>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnimatedSections;