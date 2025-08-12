import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ClassicSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const leftTextRef = useRef<HTMLDivElement>(null);
  const rightTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    const leftText = leftTextRef.current;
    const rightText = rightTextRef.current;

    if (!section || !image || !leftText || !rightText) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=200%',
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        }
      });

      // 初始狀態
      gsap.set(image, {
        scale: 0.33
      });
      
      gsap.set([leftText, rightText], {
        opacity: 0
      });

      // 圖片從 scale 0.33 → 1，置中放大
      tl.to(image, {
        scale: 1,
        duration: 1.5,
        ease: "power2.out"
      }, 0);

      // 左下角文字延遲淡入
      tl.to(leftText, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out"
      }, 0.3);

      // 右上角文字延遲淡入
      tl.to(rightText, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out"
      }, 0.6);

      return () => {
        tl.kill();
      };
    });

    mm.add("(max-width: 767px)", () => {
      gsap.set(image, {
        scale: 1
      });
      gsap.set([leftText, rightText], {
        opacity: 1
      });
    });

    return () => {
      mm.revert();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} className="section-classic relative w-full h-screen overflow-hidden bg-gray-900">
      {/* 置中圖片 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img 
          ref={imageRef}
          src="/images/classic-bg.jpg" 
          alt="經典" 
          className="w-4/5 h-4/5 object-cover rounded-lg"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* Fallback gradient */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4/5 h-4/5 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg" />
        </div>
      </div>

      {/* 左下角文字 */}
      <div ref={leftTextRef} className="absolute bottom-10 left-10 text-white">
        <h3 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontSize: '36px' }}>
          經典傳承
        </h3>
        <p className="text-base md:text-lg max-w-sm" style={{ fontSize: '16px' }}>
          歷久彌新的建築美學
        </p>
      </div>

      {/* 右上角文字 */}
      <div ref={rightTextRef} className="absolute top-10 right-10 text-white text-right">
        <h3 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontSize: '36px' }}>
          永恆價值
        </h3>
        <p className="text-base md:text-lg max-w-sm" style={{ fontSize: '16px' }}>
          每個作品都是時代的印記
        </p>
      </div>
    </section>
  );
};

export default ClassicSection;