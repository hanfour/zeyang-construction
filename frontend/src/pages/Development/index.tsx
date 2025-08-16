import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import PageBanner from '@/components/Layout/PageBanner';
import MenuButton from '@/components/Layout/MenuButton';
import NavigationMenu from '@/components/Layout/NavigationMenu';
import projectService from '@/services/project.service';
import { getImageUrl } from '@/utils/image';
import { Project } from '@/types';



const DevelopmentPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 獲取規劃中專案數據
  useEffect(() => {
    const fetchPlanningProjects = async () => {
      try {
        setLoading(true);
        const response = await projectService.getProjects({
          status: 'planning',
          orderBy: 'created_at',
          orderDir: 'DESC',
          limit: 10
        });

        if (response.success && response.data) {
          setProjects(response.data.items);
        }
      } catch (error) {
        console.error('Error fetching planning projects:', error);
        toast.error('無法載入開發專案');
      } finally {
        setLoading(false);
      }
    };

    fetchPlanningProjects();
  }, []);


  const BANNER_HEIGHT = 288;

  const bannerConfig = {
    logoSection: {
      iconSrc: "/images/logo-icon-brand.svg",
      iconAlt: "澤暘建設",
      subtitle: "LAND DERVELOPMENT",
      title: "開發專區"
    },
    centralContent: {
      text: "精挑細選市中心黃金地段，打造品質卓越的高端住宅代表作\n以下為澤暘籌備中的都更專案，敬請期待"
    },
    backgroundImage: "/images/development/top-bn-develop.png"
  };

  return (
    <>
      <Helmet>
        <title>開發專區 - 澤暘建設</title>
        <meta name="description" content="精挑細選市中心黃金地段，打造品質卓越的高端住宅代表作" />
      </Helmet>

      {/* Hero Section */}
      <PageBanner config={bannerConfig}>
        {/* Menu Button */}
        <MenuButton 
          isOpen={isMenuOpen} 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          color={scrollY > BANNER_HEIGHT ? 'dark' : 'light'}
        />
        
        {/* Navigation Menu */}
        <NavigationMenu 
          isOpen={isMenuOpen} 
          onClose={() => setIsMenuOpen(false)} 
        />
      </PageBanner>

      {/* Development Projects Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          {loading ? (
            // 載入中顯示骨架畫面
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={`loading-${index}`} className="relative group">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-gray-500">載入中...</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : projects.length > 0 ? (
            // 顯示專案卡片
            <div className={`gap-8 ${
              projects.length < 3 
                ? 'flex flex-wrap justify-center' 
                : 'grid grid-cols-1 md:grid-cols-3'
            }`}>
              {projects.map((project) => (
                <div key={project.id} className={`relative group ${
                  projects.length < 3 ? 'w-full max-w-sm md:max-w-md' : ''
                }`}>
                  <div className="relative aspect-[4/5] overflow-hidden">
                    {/* Building Image */}
                    {project.main_image ? (
                      <img 
                        src={getImageUrl(project.main_image.file_path)}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          // 如果主圖載入失敗，嘗試使用第一張圖片
                          if (project.images && project.images.length > 0) {
                            e.currentTarget.src = getImageUrl(project.images[0].file_path);
                          } else {
                            // 如果沒有圖片，顯示佔位符
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = `
                              <div class="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                <div class="text-gray-500">${project.title}</div>
                              </div>
                            `;
                          }
                        }}
                      />
                    ) : project.images && project.images.length > 0 ? (
                      <img 
                        src={getImageUrl(project.images[0].file_path)}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = `
                            <div class="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                              <div class="text-gray-500">${project.title}</div>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <div className="text-gray-500">{project.title}</div>
                      </div>
                    )}
                    
                    {/* Gradient Overlay */}
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(to bottom, transparent 0%, rgba(200, 160, 99, 0.8) 100%)'
                      }}
                    />
                    
                    {/* Project location Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="text-white text-xl md:text-2xl font-bold text-center px-4">
                        {project.location}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Coming Soon Button - 超出卡片區塊 */}
                  <div className="absolute -bottom-6 -left-6 z-10">
                    <div className="bg-[#c8a063] text-white p-4 shadow-lg">
                      <div className="text-center mb-2">
                        <div className="text-xs lg:text-sm font-bold tracking-widest">COMING SOON</div>
                      </div>
                      <div className="text-center">
                        <div className="text-content-mobile lg:text-content-desktop font-bold min-w-[8.25em] tracking-wider">
                          敬請期待
                        </div>
                      </div>
                    </div>
                    <div className="w-full absolute top-[50%] -translate-y-full -right-2 flex justify-center items-center">
                      <img src="/images/icons/icons_more_arrow.png" alt="" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // 沒有專案時顯示
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">目前暫無開發專案</div>
              <div className="text-gray-400">敬請期待我們即將推出的精彩專案</div>
            </div>
          )}
        </div>
      </section>

    </>
  );
};

export default DevelopmentPage;