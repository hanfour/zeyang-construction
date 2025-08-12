import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const AnimatedSections: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dreamSectionRef = useRef<HTMLDivElement>(null);
  const dreamContentRef = useRef<HTMLDivElement>(null);
  const dreamBgRef = useRef<HTMLDivElement>(null);
  const craftSectionRef = useRef<HTMLDivElement>(null);
  const sustainSectionRef = useRef<HTMLDivElement>(null);
  const classicSectionRef = useRef<HTMLDivElement>(null);
  const classicImageRef = useRef<HTMLImageElement>(null);
  const classicLeftTextRef = useRef<HTMLDivElement>(null);
  const classicRightTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const dreamSection = dreamSectionRef.current;
    const dreamContent = dreamContentRef.current;
    const dreamBg = dreamBgRef.current;
    const craftSection = craftSectionRef.current;
    const sustainSection = sustainSectionRef.current;
    const classicSection = classicSectionRef.current;
    const classicImage = classicImageRef.current;
    const classicLeftText = classicLeftTextRef.current;
    const classicRightText = classicRightTextRef.current;

    if (!container || !dreamSection || !dreamContent || !dreamBg || 
        !craftSection || !sustainSection || !classicSection || 
        !classicImage || !classicLeftText || !classicRightText) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
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
      // 移動版：所有區塊垂直排列
      gsap.set([dreamSection, craftSection, sustainSection, classicSection], {
        position: 'relative',
        width: '100%',
        height: '100vh',
        x: 0,
        y: 0,
        opacity: 1
      });

      gsap.set(classicImage, {
        scale: 1
      });

      gsap.set([classicLeftText, classicRightText], {
        opacity: 1
      });
    });

    return () => {
      mm.revert();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="w-full">
      {/* 動畫容器 */}
      <div ref={containerRef} className="relative w-full h-screen overflow-hidden">
        {/* 築夢區塊 */}
        <div ref={dreamSectionRef} className="section-dream absolute inset-0">
        <div ref={dreamBgRef} className="absolute inset-0 w-full h-full">
          <img 
            src="/images/dream-bg.jpg" 
            alt="築夢背景" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-amber-100" />
        </div>
        <div ref={dreamContentRef} className="relative h-full flex items-center justify-center z-10">
          <div className="text-center px-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              築夢
            </h1>
            <h2 className="text-lg md:text-xl lg:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto">
              建築夢想，創造永恆價值
            </h2>
            <button className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300">
              探索更多
            </button>
          </div>
        </div>
      </div>

      {/* 精工區塊 */}
      <div ref={craftSectionRef} className="section-craft">
        <div className="relative w-full h-full bg-gray-100">
          <img 
            src="/images/craft-bg.jpg" 
            alt="精工" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200/80 to-gray-300/80" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white p-8">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                精工
              </h2>
              <p className="text-base md:text-lg max-w-md mx-auto">
                每一個細節都是我們對品質的承諾
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 永續區塊 */}
      <div ref={sustainSectionRef} className="section-sustain">
        <div className="relative w-full h-full bg-green-50">
          <div className="relative w-full h-full flex flex-col">
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  永續
                </h2>
                <p className="text-base md:text-lg text-gray-700 max-w-md mx-auto">
                  以綠色建築理念，為下一代打造永續生活環境
                </p>
              </div>
            </div>
            <div className="flex-1 relative">
              <img 
                src="/images/sustain-bg.jpg" 
                alt="永續" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-green-100/80 to-green-200/80" />
            </div>
          </div>
        </div>
      </div>

      {/* 經典區塊 */}
      <div ref={classicSectionRef} className="section-classic">
        <div className="relative w-full h-full bg-gray-900">
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              ref={classicImageRef}
              src="/images/classic-bg.jpg" 
              alt="經典" 
              className="w-4/5 h-4/5 object-cover bg-white"
            />
            {/* <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4/5 h-4/5 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg" />
            </div> */}
          </div>

          <div ref={classicLeftTextRef} className="absolute bottom-10 left-10 text-white">
            <h3 className="text-3xl md:text-4xl font-bold mb-2">
              經典傳承
            </h3>
            <p className="text-base md:text-lg max-w-sm">
              歷久彌新的建築美學
            </p>
          </div>

          <div ref={classicRightTextRef} className="absolute top-10 right-10 text-white text-right">
            <h3 className="text-3xl md:text-4xl font-bold mb-2">
              永恆價值
            </h3>
            <p className="text-base md:text-lg max-w-sm">
              每個作品都是時代的印記
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default AnimatedSections;