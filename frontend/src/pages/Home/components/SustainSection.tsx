import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SustainSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const textContainer = textContainerRef.current;
    const title = titleRef.current;
    const description = descriptionRef.current;
    const image = imageRef.current;

    if (!section || !textContainer || !title || !description || !image) return;

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
      gsap.set(textContainer, {
        opacity: 0,
        y: 40
      });
      
      gsap.set(image, {
        opacity: 0,
        y: 60
      });

      // 文字先淡入
      tl.to(textContainer, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out"
      }, 0);

      // 圖片由下往上淡入（延遲）
      tl.to(image, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out"
      }, 0.3);

      return () => {
        tl.kill();
      };
    });

    mm.add("(max-width: 767px)", () => {
      gsap.set([textContainer, image], {
        opacity: 1,
        y: 0
      });
    });

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="section-sustain relative w-full h-screen overflow-hidden">
      {/* 右半部 - 永續區塊 */}
      <div className="absolute right-0 top-0 w-1/2 h-full bg-green-50">
        <div className="relative w-full h-full flex flex-col">
          {/* 文字區域 */}
          <div ref={textContainerRef} className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <h2 ref={titleRef} className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" style={{ fontSize: '40px' }}>
                永續
              </h2>
              <p ref={descriptionRef} className="text-base md:text-lg text-gray-700 max-w-md mx-auto" style={{ fontSize: '16px' }}>
                以綠色建築理念，為下一代打造永續生活環境
              </p>
            </div>
          </div>
          
          {/* 圖片區域 */}
          <div className="flex-1 relative">
            <img 
              ref={imageRef}
              src="/images/sustain-bg.jpg" 
              alt="永續" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            {/* Fallback gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SustainSection;