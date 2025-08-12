import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const HeroSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const heroLeftRef = useRef<HTMLDivElement>(null);
  const heroSubtitleRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroLineRef = useRef<HTMLDivElement>(null);
  const heroRightRef = useRef<HTMLDivElement>(null);
  const heroBlockRefs = useRef<HTMLDivElement[]>([]);
  const heroMaskRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const heroLeft = heroLeftRef.current;
    const subtitle = heroSubtitleRef.current;
    const title = heroTitleRef.current;
    const line = heroLineRef.current;
    const heroRight = heroRightRef.current;
    const blocks = heroBlockRefs.current;
    const masks = heroMaskRefs.current;

    if (!section || !heroLeft || !subtitle || !title || !line || !heroRight || blocks.length === 0 || masks.length === 0) return;

    // 檢查是否需要減少動畫
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 初始狀態設置
    gsap.set([subtitle, title], {
      opacity: 0
    });

    gsap.set(line, {
      height: 0
    });

    if (!prefersReducedMotion) {
      // 初始化遮罩 - 完全覆蓋
      gsap.set(masks, {
        left: 0,
        right: 0
      });
    } else {
      // 減少動畫模式：直接隱藏遮罩
      gsap.set(masks, {
        display: 'none'
      });
      gsap.set(line, {
        height: '100%'
      });
    }

    // 文字淡入動畫（頁面載入時執行）
    gsap.to([subtitle, title], {
      opacity: 1,
      duration: 0.6,
      stagger: 0.15,
      ease: 'power2.out'
    });

    if (!prefersReducedMotion) {
      // 垂直線條動畫 - 根據整個區塊的滾動進度
      gsap.to(line, {
        height: '100%',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 1,
          ease: 'none'
        }
      });

      // 為每個右側區塊的遮罩設置獨立的動畫觸發
      masks.forEach((mask, index) => {
        const block = blocks[index];
        
        gsap.to(mask, {
          left: '100%',
          duration: 0.8,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: block,
            start: 'top 80%', // 當區塊頂部到達視窗 80% 位置時觸發
            toggleActions: 'play none none reverse',
            onStart: () => {
              block.classList.add('show');
            },
            onReverseComplete: () => {
              block.classList.remove('show');
            }
          }
        });
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const setBlockRef = (el: HTMLDivElement | null, index: number) => {
    if (el) heroBlockRefs.current[index] = el;
  };

  const setMaskRef = (el: HTMLDivElement | null, index: number) => {
    if (el) heroMaskRefs.current[index] = el;
  };

  return (
    <section ref={sectionRef} className="section-hero w-full min-h-screen bg-white flex">
      {/* 左側文字 + 垂直線條 */}
      <div ref={heroLeftRef} className="hero-left w-2/12 lg:w-3/12 relative flex flex-col items-center justify-center gap-12 lg:gap-24 pt-24 lg:pt-32">
        <div className="flex items-center gap-8">
          {/* 垂直文字容器 */}
          <div className="flex flex-col items-center gap-6">
            <div 
              ref={heroSubtitleRef} 
              className="hero-subtitle text-sm md:text-base font-normal text-black"
              style={{ 
                writingMode: 'vertical-rl',
                letterSpacing: '0.05em',
                willChange: 'opacity'
              }}
            >
              細節取勝的美學建築家
            </div>
            <h1 
              ref={heroTitleRef} 
              className="hero-title text-2xl md:text-[32px] font-bold text-black"
              style={{ 
                writingMode: 'vertical-rl',
                letterSpacing: '0.1em',
                willChange: 'opacity'
              }}
            >
              澤暘建築
            </h1>
          </div>
        </div>
        
        {/* 垂直線條 - 固定在右側邊界 */}
        <div 
          ref={heroLineRef} 
          className="hero-line w-[2px] bg-black"
          style={{ 
            willChange: 'height',
            transformOrigin: 'top'
          }}
        />
      </div>

      {/* 右側內容 */}
      <div ref={heroRightRef} className="hero-right flex-1 flex flex-col">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            ref={(el) => setBlockRef(el, index)}
            className="hero-block w-full h-[25vh] lg:h-[50vh] relative overflow-hidden"
          >
            {/* 背景圖片層 */}
            <div 
              className={`w-full h-full bg-cover bg-center ${
                index === 0 ? 'bg-gradient-to-br from-amber-100 to-amber-200' :
                index === 1 ? 'bg-gradient-to-br from-gray-100 to-gray-200' :
                index === 2 ? 'bg-gradient-to-br from-green-100 to-green-200' :
                'bg-gradient-to-br from-slate-100 to-slate-200'
              }`}
            >
              {/* 如果有圖片，可以使用以下代碼 */}
              {/* <img 
                src={`/images/hero-block-${index + 1}.jpg`} 
                alt={`區塊 ${index + 1}`}
                className="w-full h-full object-cover"
              /> */}
            </div>
            
            {/* 白色遮罩層 */}
            <div
              ref={(el) => setMaskRef(el, index)}
              className="absolute inset-y-0 bg-white z-10"
              style={{
                willChange: 'left',
                left: 0,
                right: 0
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;