import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const DreamSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLHeadingElement>(null);
  const paragraphLinesRef = useRef<(HTMLSpanElement | null)[]>([]);
  const bgImageRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const paragraphLines = paragraphLinesRef.current.filter(Boolean);
    const bgImage = bgImageRef.current;
    const overlay = overlayRef.current;

    if (!section || !title || !subtitle || paragraphLines.length === 0) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=150%',
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
        }
      });

      gsap.set([title, subtitle, ...paragraphLines], {
        opacity: 0,
        y: 20
      });

      tl.to(bgImage, {
        scale: 1.1,
        duration: 1,
        ease: "power2.out"
      }, 0)
      .to(overlay, {
        opacity: 0.15,
        duration: 0.8,
        ease: "power2.out"
      }, 0)
      .to(title, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
      }, 0.1)
      .to(subtitle, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
      }, 0.3)
      .to(paragraphLines, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.12,
        ease: "power2.out"
      }, 0.5);

      return () => {
        tl.kill();
      };
    });

    mm.add("(max-width: 767px)", () => {
      gsap.set([title, subtitle, ...paragraphLines], {
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
    <section ref={sectionRef} className="relative w-full h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          ref={bgImageRef}
          src="/images/dream-bg.jpg" 
          alt="築夢背景" 
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            // Fallback to gradient background if image fails to load
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* Fallback gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-amber-100" />
        
        {/* Dark overlay for better text visibility */}
        <div ref={overlayRef} className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content Container */}
      <div className="relative h-full flex items-center justify-center lg:justify-start z-10">
        {/* Text content positioned 30% from left */}
        <div className="lg:ml-[30%] flex items-center space-x-4 lg:space-x-12 h-full">
          {/* Left side - Vertical title */}
          <div className="flex items-start justify-start">
            <h2 
              ref={titleRef}
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-primary tracking-wider"
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'upright',
                letterSpacing: '0.2em'
              }}
            >
              築夢。
            </h2>
          </div>
          
          {/* Right side - Subtitle and content */}
          <div className="max-w-md pt-24 lg:pt-32">
            <h3 ref={subtitleRef} className="text-lg md:text-xl font-semibold text-gray-800 mb-6 leading-relaxed">
              築一座能安放幸福的家
            </h3>
            <p className="text-xs/8 md:text-sm/8 text-gray-700">
              <span ref={el => paragraphLinesRef.current[0] = el} className="block">
                建築的起點，從一磚一瓦開始，用心描繪出對未來的想像
              </span>
              <span ref={el => paragraphLinesRef.current[1] = el} className="block">
                從晨光灑落的餐桌，到深夜仍亮著的燈火
              </span>
              <span ref={el => paragraphLinesRef.current[2] = el} className="block">
                從家人間的歡聲笑語，到細水長流的溫馨
              </span>
              <span ref={el => paragraphLinesRef.current[3] = el} className="block">
                家的模樣，就是幸福最真實的模樣
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DreamSection;