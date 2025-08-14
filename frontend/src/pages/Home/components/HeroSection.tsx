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
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 1
        }
      });

      // 為每個右側區塊的遮罩設置獨立的動畫觸發
      masks.forEach((mask, index) => {
        const block = blocks[index];
        
        // 創建動畫時間軸
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: block,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
            onEnter: () => {
              block.classList.add('show');
            },
            onLeave: () => {
              block.classList.remove('show');
            },
            onEnterBack: () => {
              block.classList.add('show');
            },
            onLeaveBack: () => {
              block.classList.remove('show');
            },
            // 啟用重新觸發，確保動畫可以重複播放
            refreshPriority: 1
          }
        });

        tl.to(mask, {
          left: '100%',
          duration: 0.8,
          ease: 'power2.inOut'
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
    <section ref={sectionRef} className="section-hero w-full min-h-screen py-8 md:pb-24 bg-white flex">
      {/* 左側文字 + 垂直線條 */}
      <div ref={heroLeftRef} className="hero-left w-2/12 lg:w-3/12 relative flex flex-col items-center justify-center gap-12 lg:gap-24 pt-24 lg:pt-32">
        <div className="flex items-center gap-8">
          {/* 垂直文字容器 */}
          <div className="flex flex-col items-center gap-6">
            <div 
              ref={heroSubtitleRef} 
              className="text-sub-title-mobile lg:text-sub-title-desktop font-normal text-black"
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
              className="text-main-large-title-mobile lg:text-main-large-title-desktop font-bold text-black"
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
          className="hero-line w-[2px] bg-primary-more"
          style={{ 
            willChange: 'height',
            transformOrigin: 'top'
          }}
        />
      </div>

      {/* 右側內容 */}
      <div ref={heroRightRef} className="hero-right flex-1 flex flex-col gap-1">
        {[0, 1, 2, 3].map((index) => {
          const isEven = index % 2 === 0;
          const textData = [
            { title: '尺度生活', subtitle: '獨具品味‧美感靈魂' },
            { title: '城市遠見 ', subtitle: '市心角地‧緊鄰捷運' },
            { title: '永續共好', subtitle: '永續自然‧情感連結' },
            { title: '負責務實 ', subtitle: '講究細節‧安心品質' }
          ];
          
          return (
            <div
              key={index}
              ref={(el) => setBlockRef(el, index)}
              className="hero-block w-full h-[25vh] lg:h-[50vh] relative overflow-hidden"
            >
              {/* 背景圖片層 */}
              <div 
                className={`w-full h-full bg-cover bg-center`}
              >
                {/* 如果有圖片，可以使用以下代碼 */}
                <img 
                  src={`/images/index/feature-${index + 1}.jpg`} 
                  alt={`區塊 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* 文字區塊 - 在圖片上方 */}
              <div className="absolute inset-0 flex items-center z-5">
                <div className={`${
                  isEven 
                    ? 'ml-[15%]' // 單數圖片靠左（index 0, 2）
                    : 'ml-auto mr-[15%]' // 雙數圖片靠右（index 1, 3）
                }`}>
                  <div className="text-white">
                    <h3 className="text-main-title-mobile lg:text-main-title-desktop font-bold mb-2 lg:mb-4 drop-shadow-md">
                      {textData[index].title}
                    </h3>
                    <p className="text-sub-title-mobile lg:text-sub-title-desktop font-normal opacity-90 drop-shadow-lg">
                      {textData[index].subtitle}
                    </p>
                  </div>
                </div>
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
          );
        })}
      </div>
    </section>
  );
};

export default HeroSection;