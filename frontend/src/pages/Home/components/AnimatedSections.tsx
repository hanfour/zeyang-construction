import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
      <div className="hidden md:block w-full">
        <div ref={containerRef} className="relative w-full h-screen overflow-hidden">
          {/* 築夢區塊 */}
          <div ref={dreamSectionDesktopRef} className="section-dream absolute inset-0">
            <div ref={dreamBgDesktopRef} className="absolute inset-0 w-full h-full">
              <img 
                src="https://picsum.photos/seed/dream/1920/1080" 
                alt="築夢背景" 
                className="w-full h-full object-cover"
              />
              {/* <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-amber-100" /> */}
            </div>
            <div ref={dreamContentDesktopRef} className="relative h-full flex items-center justify-center z-10">
              <div className="text-center px-6">
                <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
                  築夢
                </h1>
                <h2 className="text-xl lg:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto">
                  建築夢想，創造永恆價值
                </h2>
              </div>
            </div>
          </div>

          {/* 精工區塊 */}
          <div ref={craftSectionDesktopRef} className="section-craft absolute left-0 top-0 w-1/2 h-full">
            <div className="relative w-full h-full bg-white pb-32">
              <img 
                src="https://picsum.photos/seed/craft/1920/1080" 
                alt="精工" 
                className="w-full h-full object-cover"
              />
              {/* <div className="absolute inset-0 bg-gradient-to-br from-gray-200/80 to-gray-300/80" /> */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="craft-content text-center text-white p-8">
                  <h2 className="text-5xl font-bold mb-4">
                    精工
                  </h2>
                  <p className="text-lg max-w-md mx-auto">
                    每一個細節都是我們對品質的承諾
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 永續區塊 */}
          <div ref={sustainSectionDesktopRef} className="section-sustain absolute right-0 top-0 w-1/2 h-full pb-4">
            <div className="relative w-full h-full flex items-end">
              <div className="relative w-full flex flex-col justify-center items-center">
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <h2 className="text-5xl font-bold text-gray-900 mb-4">
                      永續
                    </h2>
                    <p className="text-lg text-gray-700 max-w-md mx-auto">
                      以綠色建築理念，為下一代打造永續生活環境
                    </p>
                  </div>
                </div>
                <div className="relative overflow-hidden flex justify-center items-center">
                  <div className="sustain-image relative inset-0 w-full max-w-[50%] aspect-video">
                    <img 
                      src="https://picsum.photos/seed/sustain/1920/1080" 
                      alt="永續" 
                      className="w-full object-cover"
                    />
                    {/* <div className="absolute inset-0 bg-gradient-to-br from-green-100/80 to-green-200/80" /> */}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 經典區塊 */}
          <div ref={classicSectionDesktopRef} className="section-classic absolute inset-0">
            <div className="relative w-full h-full bg-gray-900 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  ref={classicImageDesktopRef}
                  src="https://picsum.photos/seed/classic/1920/1080" 
                  alt="經典" 
                  className="w-4/5 h-4/5 object-cover"
                />
              </div>
              <div ref={classicLeftTextDesktopRef} className="absolute bottom-10 left-10 text-white">
                <h3 className="text-4xl font-bold mb-2">
                  經典傳承
                </h3>
                <p className="text-lg max-w-sm">
                  歷久彌新的建築美學
                </p>
              </div>
              <div ref={classicRightTextDesktopRef} className="absolute top-10 right-10 text-white text-right">
                <h3 className="text-4xl font-bold mb-2">
                  永恆價值
                </h3>
                <p className="text-lg max-w-sm ml-auto">
                  每個作品都是時代的印記
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 手機版：獨立區塊 */}
      <div className="md:hidden w-full">
        {/* 築夢區塊 */}
        <div ref={dreamSectionMobileRef} className="section-dream relative h-screen">
          <div ref={dreamBgMobileRef} className="absolute inset-0 w-full h-full">
            <img 
              src="https://picsum.photos/seed/dream/1920/1080" 
              alt="築夢背景" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 to-amber-100/30" />
          </div>
          <div ref={dreamContentMobileRef} className="relative h-full flex items-center justify-center z-10">
            <div className="text-center px-6">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 drop-shadow-lg">
                築夢
              </h1>
              <h2 className="text-base sm:text-lg text-white mb-8 max-w-2xl mx-auto drop-shadow-lg">
                建築夢想，創造永恆價值
              </h2>
              <button className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300">
                探索更多
              </button>
            </div>
          </div>
        </div>

        {/* 精工區塊 */}
        <div ref={craftSectionMobileRef} className="section-craft relative h-screen">
          <div className="relative w-full h-full bg-gray-100">
            <img 
              src="https://picsum.photos/seed/craft/1920/1080" 
              alt="精工" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200/60 to-gray-300/60" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="craft-content text-center text-white p-8">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  精工
                </h2>
                <p className="text-sm sm:text-base max-w-md mx-auto">
                  每一個細節都是我們對品質的承諾
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 永續區塊 */}
        <div ref={sustainSectionMobileRef} className="section-sustain relative h-screen bg-green-50">
          <div className="relative w-full h-full flex flex-col">
            <div className="h-1/2 flex items-center justify-center p-8">
              <div className="text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  永續
                </h2>
                <p className="text-sm sm:text-base text-gray-700 max-w-md mx-auto">
                  以綠色建築理念，為下一代打造永續生活環境
                </p>
              </div>
            </div>
            <div className="h-1/2 relative overflow-hidden">
              <div className="sustain-image absolute inset-0 w-full h-full">
                <img 
                  src="https://picsum.photos/seed/sustain/1920/1080" 
                  alt="永續" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-green-100/60 to-green-200/60" />
              </div>
            </div>
          </div>
        </div>

        {/* 經典區塊 */}
        <div ref={classicSectionMobileRef} className="section-classic relative h-screen">
          <div className="relative w-full h-full bg-gray-900 overflow-hidden">
            <div className="absolute inset-0">
              <img 
                ref={classicImageMobileRef}
                src="https://picsum.photos/seed/classic/1920/1080" 
                alt="經典" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30" />
            </div>
            <div ref={classicLeftTextMobileRef} className="absolute inset-0 flex items-center justify-center text-white z-10">
              <div className="text-center px-6">
                <h3 className="text-2xl sm:text-3xl font-bold mb-2">
                  經典傳承
                </h3>
                <p className="text-sm sm:text-base max-w-sm">
                  歷久彌新的建築美學
                </p>
              </div>
            </div>
            <div ref={classicRightTextMobileRef} className="absolute bottom-10 left-0 right-0 text-white text-center z-10 px-6">
              <h3 className="text-2xl sm:text-3xl font-bold mb-2">
                永恆價值
              </h3>
              <p className="text-sm sm:text-base max-w-sm mx-auto">
                每個作品都是時代的印記
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnimatedSections;