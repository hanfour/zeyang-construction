import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface DreamSectionProps {
  onBackgroundShifted?: () => void;
}

const DreamSection: React.FC<DreamSectionProps> = ({ onBackgroundShifted }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLHeadingElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const bgContainerRef = useRef<HTMLDivElement>(null);
  const bgImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const cta = ctaRef.current;
    const bgContainer = bgContainerRef.current;
    const bgImage = bgImageRef.current;

    if (!section || !content || !title || !subtitle || !cta || !bgContainer || !bgImage) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=300%',
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        }
      });

      gsap.set([title, subtitle, cta], {
        opacity: 1,
        y: 0
      });

      // 滾動階段 1：文字向上移動並淡出
      tl.to(content, {
        y: -100,
        opacity: 0,
        duration: 1,
        ease: "power2.inOut"
      }, 0);

      // 滾動階段 2：背景圖向左移至螢幕寬度 50%
      tl.to(bgContainer, {
        x: '-25%',
        width: '50%',
        duration: 1.5,
        ease: "power2.inOut",
        onComplete: () => {
          if (onBackgroundShifted) onBackgroundShifted();
        }
      }, 0.5);

      // 保持背景在左側
      tl.set(bgContainer, {
        position: 'fixed',
        left: 0,
        x: 0
      }, 2);

      return () => {
        tl.kill();
      };
    });

    mm.add("(max-width: 767px)", () => {
      gsap.set([title, subtitle, cta], {
        opacity: 1,
        y: 0
      });
    });

    return () => {
      mm.revert();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} className="section-dream relative w-full h-screen overflow-hidden">
      {/* Background Container - 可以向左移動 */}
      <div ref={bgContainerRef} className="absolute inset-0 w-full h-full">
        <img 
          ref={bgImageRef}
          src="/images/dream-bg.jpg" 
          alt="築夢背景" 
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* Fallback gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-amber-100" />
      </div>

      {/* Content Container - 中央文字內容 */}
      <div ref={contentRef} className="relative h-full flex items-center justify-center z-10">
        <div className="text-center px-6">
          {/* 主標題 */}
          <h1 
            ref={titleRef}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6"
            style={{ fontSize: '48px' }}
          >
            築夢
          </h1>
          
          {/* 副標題 */}
          <h2 ref={subtitleRef} className="text-lg md:text-xl lg:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto">
            建築夢想，創造永恆價值
          </h2>
          
          {/* CTA按鈕 */}
          <button 
            ref={ctaRef}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300"
          >
            探索更多
          </button>
        </div>
      </div>
    </section>
  );
};

export default DreamSection;