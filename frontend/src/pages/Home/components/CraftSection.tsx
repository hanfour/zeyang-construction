import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CraftSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    const textContainer = textContainerRef.current;
    const title = titleRef.current;
    const description = descriptionRef.current;

    if (!section || !image || !textContainer || !title || !description) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        }
      });

      // 初始狀態
      gsap.set([image, textContainer], {
        opacity: 0
      });
      
      gsap.set(image, {
        y: -40
      });

      // 圖片由上至下淡入
      tl.to(image, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out"
      }, 0);

      // 文字區塊隨圖片進場淡入
      tl.to(textContainer, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out"
      }, 0.2);

      return () => {
        tl.kill();
      };
    });

    mm.add("(max-width: 767px)", () => {
      gsap.set([image, textContainer], {
        opacity: 1,
        y: 0
      });
    });

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="section-craft relative w-full h-screen overflow-hidden">
      {/* 左半部 - 精工區塊 */}
      <div className="absolute left-0 top-0 w-1/2 h-full bg-gray-100">
        {/* 圖片容器 */}
        <div className="relative w-full h-full">
          <img 
            ref={imageRef}
            src="/images/craft-bg.jpg" 
            alt="精工" 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          {/* Fallback gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
          
          {/* 文字覆蓋在圖片上 */}
          <div ref={textContainerRef} className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white p-8">
              <h2 ref={titleRef} className="text-4xl md:text-5xl font-bold mb-4" style={{ fontSize: '40px' }}>
                精工
              </h2>
              <p ref={descriptionRef} className="text-base md:text-lg max-w-md mx-auto" style={{ fontSize: '16px' }}>
                每一個細節都是我們對品質的承諾，用匠心精神打造永恆建築
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CraftSection;