import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { getImageUrl } from '@/utils/image';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

gsap.registerPlugin(ScrollTrigger);

interface Project {
  id: number;
  title: string;
  subtitle?: string;
  category: string;
  status: string;
  location: string;
  is_featured: number;
  main_image?: {
    file_path: string;
    thumbnails: {
      LARGE: { path: string; width: number; height: number; filename: string; };
      MEDIUM: { path: string; width: number; height: number; filename: string; };
      SMALL: { path: string; width: number; height: number; filename: string; };
      THUMBNAIL: { path: string; width: number; height: number; filename: string; };
      ORIGINAL: { path: string; width: number; height: number; filename: string; };
      optimized: { path: string; width: number; height: number; filename: string; };
    };
  };
}

const HotProjects: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const currentImageMaskRef = useRef<HTMLDivElement>(null);
  const nextImageMaskRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLDivElement>(null);
  const [isAnimated, setIsAnimated] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const idleAnimationRef = useRef<GSAPTimeline | null>(null);

  // 獲取精選專案數據
  const fetchFeaturedProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5001/api/projects/featured?limit=6');
      if (!response.ok) {
        throw new Error('Failed to fetch featured projects');
      }
      const data = await response.json();
      
      // 檢查響應結構：{ success: true, data: { items: [] } }
      const projectsArray = data.success && data.data && data.data.items ? data.data.items : [];
      
      // 過濾符合條件的專案：必須是精選且狀態為規劃中、預售或銷售中
      // 注意：API 中 status 是英文 (pre_sale)，is_featured 是數字 (1)
      const allowedStatuses = ['planning', 'pre_sale', 'selling']; // 英文狀態
      const filteredProjects = projectsArray.filter((project: any) => 
        project.is_featured === 1 && allowedStatuses.includes(project.status)
      );
      
      setProjects(filteredProjects);
    } catch (error) {
      console.error('Error fetching featured projects:', error);
      // 如果API失敗，使用備用數據
      setProjects([
        {
          id: 1,
          title: '都心典藏',
          category: '住宅',
          location: '台北市中正區',
          status: 'selling',
          is_featured: 1
        },
        {
          id: 2,
          title: '水岸第一排',
          category: '住宅',
          location: '台北市大安區',
          status: 'pre_sale',
          is_featured: 1
        },
        {
          id: 3,
          title: '森林秘境',
          category: '住宅',
          location: '台北市信義區',
          status: 'planning',
          is_featured: 1
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 載入專案數據
  useEffect(() => {
    fetchFeaturedProjects();
  }, []);

  // 進場動畫
  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const sliderContainer = sliderContainerRef.current;
    const currentMask = currentImageMaskRef.current;
    const nextMask = nextImageMaskRef.current;
    const moreButton = moreButtonRef.current;

    if (!section || !title || !subtitle || !sliderContainer || !currentMask || !nextMask || !moreButton) return;

    // 初始狀態設置
    gsap.set([title, subtitle], {
      opacity: 0
    });

    gsap.set(moreButton, {
      opacity: 0,
      y: 30
    });

    gsap.set(currentMask, {
      scaleX: 1,
      transformOrigin: 'left center'
    });

    gsap.set(nextMask, {
      scaleX: 1,
      transformOrigin: 'right center'
    });

    // 創建進場動畫時間軸
    const entranceTimeline = gsap.timeline({
      paused: true,
      onComplete: () => {
        setIsAnimated(true);
        // 開始待機動畫
        startIdleAnimation();
      }
    });

    // 窗簾展開動畫
    entranceTimeline
      .to(currentMask, {
        scaleX: 0,
        duration: 1.3,
        ease: 'power2.inOut'
      })
      .to(nextMask, {
        scaleX: 0,
        duration: 1.3,
        ease: 'power2.inOut'
      }, '<')
      .to([title, subtitle], {
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out'
      }, '-=0.8')
      .to(moreButton, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out'
      }, '-=0.2');

    // 滾動觸發器
    ScrollTrigger.create({
      trigger: section,
      start: 'top 70%',
      once: true,
      onEnter: () => {
        entranceTimeline.play();
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      if (idleAnimationRef.current) {
        idleAnimationRef.current.kill();
      }
    };
  }, []);

  // 待機動畫
  const startIdleAnimation = () => {
    const sliderContainer = sliderContainerRef.current;
    if (!sliderContainer || isPaused) return;

    const slides = sliderContainer.querySelectorAll('.swiper-slide-active img, .swiper-slide-next img');
    
    if (idleAnimationRef.current) {
      idleAnimationRef.current.kill();
    }

    idleAnimationRef.current = gsap.timeline({ repeat: -1 });
    
    slides.forEach(slide => {
      gsap.set(slide, { x: 0 }); // 重置位置，保持CSS中的scale
      idleAnimationRef.current?.to(slide, {
        x: '-0.725%',
        duration: 5,
        ease: 'none'
      })
      .to(slide, {
        x: 0,
        duration: 0,
        ease: 'none'
      });
    });
  };

  // 停止待機動畫
  const stopIdleAnimation = () => {
    if (idleAnimationRef.current) {
      idleAnimationRef.current.kill();
      const slides = sliderContainerRef.current?.querySelectorAll('.swiper-slide img');
      slides?.forEach(slide => {
        gsap.set(slide, { x: 0 }); // 重置位置，保持CSS中的scale
      });
    }
  };

  // 處理手動切換
  const handleSlideChange = () => {
    setIsPaused(true);
    stopIdleAnimation();
    
    // 5秒後恢復自動播放和待機動畫
    setTimeout(() => {
      setIsPaused(false);
      if (swiperRef.current && swiperRef.current.autoplay) {
        swiperRef.current.autoplay.start();
      }
      startIdleAnimation();
    }, 5000);
  };

  // 處理下一張
  const handleNext = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
      handleSlideChange();
    }
  };

  return (
    <section ref={sectionRef} className="hot-projects relative w-full py-8 md:pb-24 bg-white overflow-hidden">
      <div className="relative w-full h-[45vh] lg:h-[80vh]">
        {/* 標題層 - 絕對定位 */}
        <div className="absolute z-20 lg:left-[calc(70%-1.5rem)] lg:top-1/2 lg:-translate-y-1/2 
                        -top-8 right-4 lg:right-auto">
          <div className="flex lg:flex-row lg:gap-4 gap-2 items-start lg:items-centerq">
            {/* 主標題 - 直式文字 */}
            <h2 
              ref={titleRef}
              className="text-main-title-mobile lg:text-main-title-desktop font-bold text-gray-900"
              style={{ 
                writingMode: 'vertical-rl',
                letterSpacing: '0.1em'
              }}
            >
              我們的熱銷個案
            </h2>
            
            {/* 副標題 - 手機版直式 */}
            <p 
              ref={subtitleRef}
              className="text-content-mobile lg:text-content-desktop text-gray-600 max-w-[200px] lg:max-w-none"
              style={{ 
                writingMode: 'vertical-rl',
                letterSpacing: '0.05em',
                lineHeight: '1.8'
              }}
            >
              實現理想宜居的劃世代居所
              <br />
              嚴選市中心燙金地段，融合人本設計與極致工藝
            </p>
          </div>
        </div>

        {/* Swiper 輪播器 */}
        <div ref={sliderContainerRef} className="relative w-full h-full">
          <Swiper
            onSwiper={(swiper) => { swiperRef.current = swiper; }}
            modules={[Autoplay, Navigation, Pagination]}
            spaceBetween={0}
            slidesPerView={1.2}
            slidesPerGroup={1}
            loop={projects.length > 0}
            centeredSlides={false}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: false
            }}
            pagination={{
              clickable: true,
              el: '.swiper-pagination-custom'
            }}
            onSlideChange={(swiper) => {
              setCurrentSlideIndex(swiper.realIndex);
              if (isAnimated) {
                stopIdleAnimation();
                setTimeout(() => {
                  if (!isPaused) {
                    startIdleAnimation();
                  }
                }, 100);
              }
            }}
            breakpoints={{
              1024: {
                slidesPerView: 1.2,
                spaceBetween: 0
              },
              0: {
                slidesPerView: 1.2,
                spaceBetween: 0
              }
            }}
            className="w-full h-full"
          >
            {isLoading ? (
              // 載入中顯示骨架畫面
              Array.from({ length: 3 }).map((_, index) => (
                <SwiperSlide key={`loading-${index}`}>
                  <div className="relative w-full h-full overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-gray-500">載入中...</div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))
            ) : (
              // 如果只有一張圖片，創建三個相同的 slides 以確保 loop 正常運作
              (projects.length === 1 ? [projects[0], projects[0], projects[0]] : projects).map((project, index) => (
                <SwiperSlide key={`${project.id}-${index}`}>
                  <div className="relative w-full h-full overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 relative">
                      {project.main_image ? (
                        <img 
                          src={getImageUrl(project.main_image.file_path)}
                          alt={project.title}
                          className="w-full h-full object-cover"
                          style={{ transform: 'scale(1.1)' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          {project.title}
                        </div>
                      )}
                      
                      {/* 專案資訊覆蓋層 - 隱藏 */}
                      {/* <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-8">
                        <h3 className="text-white text-2xl lg:text-3xl font-bold mb-2">{project.title}</h3>
                        <p className="text-white/90 text-content-mobile lg:text-content-desktop">{project.description}</p>
                      </div> */}
                    </div>
                  </div>
                </SwiperSlide>
              ))
            )}
          </Swiper>

          {/* 窗簾遮罩 - 主圖片 */}
          <div 
            ref={currentImageMaskRef}
            className="absolute top-0 left-0 w-[70%] lg:w-[70%] h-full bg-white z-30 pointer-events-none"
            style={{ display: isAnimated ? 'none' : 'block' }}
          />
          
          {/* 窗簾遮罩 - 下一張圖片 */}
          <div 
            ref={nextImageMaskRef}
            className="absolute top-0 right-0 w-[30%] lg:w-[30%] h-full bg-white z-30 pointer-events-none"
            style={{ display: isAnimated ? 'none' : 'block' }}
          />

          {/* 自定義導航按鈕 */}
          <button
            onClick={handleNext}
            className="absolute right-8 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white p-4 rounded-full shadow-lg transition-all duration-300 group"
            aria-label="下一張"
          >
            <svg 
              className="w-6 h-6 text-gray-900 group-hover:translate-x-1 transition-transform duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* MORE 按鈕 - 只在主要 slider 左下角顯示 */}
          <div ref={moreButtonRef} className="absolute -bottom-4 left-8 z-20">
            <button 
              onClick={() => {
                const currentProject = projects[currentSlideIndex % projects.length];
                if (currentProject) {
                  window.location.href = `/projects#project-${currentProject.id}`;
                }
              }}
              className="block hover:scale-105 transition-transform duration-300"
            >
              <div className="bg-primary-more text-white p-4 shadow-lg">
                <div className="text-center mb-2">
                  <div className="text-xs lg:text-sm font-bold tracking-widest">MORE</div>
                </div>
                <div className="text-center">
                  <div className="text-content-mobile lg:text-content-desktop font-bold min-w-[8.25em] tracking-wider">
                    {!isLoading && projects[currentSlideIndex % projects.length]?.title}
                  </div>
                </div>
              </div>
              <div className="w-full absolute top-[50%] -translate-y-full -left-2 flex justify-center items-center">
                <img src="/images/icons/icons_more_arrow.png" alt="" />
              </div>
            </button>
          </div>

          {/* 自定義分頁指示器 */}
          <div className="swiper-pagination-custom absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2"></div>
        </div>
      </div>

      {/* 自定義樣式 */}
      <style>{`
        .hot-projects .swiper {
          overflow: visible;
        }

        .hot-projects .swiper-wrapper {
          align-items: center;
        }

        .hot-projects .swiper-slide {
          transition: transform 1.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @media (min-width: 1024px) {
          .hot-projects .swiper-slide-active {
            width: 70% !important;
          }
          
          .hot-projects .swiper-slide-next {
            width: 30% !important;
            margin-left: 10%;
          }
        }

        @media (max-width: 1023px) {
          .hot-projects .swiper-slide-active {
            width: 70% !important;
          }
          
          .hot-projects .swiper-slide-next {
            width: 30% !important;
            margin-left: 0;
          }
        }

        .hot-projects .swiper-pagination-custom {
          display: flex;
          gap: 8px;
        }

        .hot-projects .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          transition: all 0.3s;
          cursor: pointer;
        }

        .hot-projects .swiper-pagination-bullet-active {
          width: 24px;
          background: white;
          border-radius: 4px;
        }
      `}</style>
    </section>
  );
};

export default HotProjects;