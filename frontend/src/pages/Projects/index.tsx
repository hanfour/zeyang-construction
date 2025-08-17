import React, { useState, useEffect, useCallback, useMemo } from 'react';
import projectService from '@/services/project.service';
import { Project } from '@/types';
import { getImageUrl } from '@/utils/image';
import MenuButton from '@/components/Layout/MenuButton';
import NavigationMenu from '@/components/Layout/NavigationMenu';
import PageBanner from '@/components/Layout/PageBanner';
import CustomCarousel from '@/components/Carousel/CustomCarousel';
import { useInView } from 'react-intersection-observer';

// Simple Project Card Component
const ProjectCard: React.FC<{ 
  project: Project; 
  projectDetails: Record<string, Project>;
  loadingDetails: Set<string>;
  loadProjectDetails: (uuid: string) => void;
  isReversed?: boolean;
}> = React.memo(({ project, projectDetails, loadingDetails, loadProjectDetails, isReversed = false }) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: '100px 0px',
  });

  // Load details when in view
  useEffect(() => {
    if (inView) {
      loadProjectDetails(project.uuid);
    }
  }, [inView, project.uuid, loadProjectDetails]);

  // Get project data (detailed or basic)
  const detailedProject = projectDetails[project.uuid];
  const currentProject = detailedProject || project;
  const isLoadingMore = loadingDetails.has(project.uuid);
  
  // Memoize all available images to prevent recalculation
  const allImages = useMemo(() => {
    const images = [];
    if (currentProject.main_image) {
      images.push(currentProject.main_image);
    }
    if (currentProject.images) {
      images.push(...currentProject.images);
    }
    return images;
  }, [currentProject.main_image, currentProject.images]);

  return (
    <div ref={ref} className="group" id={`project-${project.uuid}`}>
      <div className={`bg-white overflow-hidden duration-300 flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
        {/* Image Section */}
        {allImages.length > 0 && (
          <div className={`order-first ${isReversed ? 'lg:order-first' : 'lg:order-last'} relative w-full lg:w-7/12`}>
            {allImages.length === 1 ? (
              // Single image display
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={getImageUrl(allImages[0].file_path)} 
                  alt={`${project.title} 圖片`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ) : (
              // Multi-image custom carousel
              <>
                {/* Mobile: Simple carousel */}
                <div className="lg:hidden">
                  <CustomCarousel
                    images={allImages.map(img => ({
                      file_path: getImageUrl(img.file_path),
                      alt: `${project.title} 圖片`
                    }))}
                    config={{
                      container: { 
                        aspectRatio: '4/5',
                        alignItems: 'start'
                      },
                      activeSlide: { 
                        aspectRatio: '4/5',
                        width: '100%'
                      },
                      nextSlide: { 
                        aspectRatio: '4/5',
                        width: '0%'
                      },
                      autoHeight: false,
                      showNavigation: true,
                      showPagination: true,
                      transitionDuration: 300
                    }}
                  />
                </div>

                {/* Desktop: Custom carousel showing current slide + next slide preview */}
                <div className="hidden lg:block">
                  <CustomCarousel
                    images={allImages.map(img => ({
                      file_path: getImageUrl(img.file_path),
                      alt: `${project.title} 圖片`
                    }))}
                    config={{
                      container: { 
                        aspectRatio: '4/5',
                        alignItems: 'start',
                        justifyContent: 'between'
                      },
                      activeSlide: { 
                        aspectRatio: '4/5',
                        width: '7/12'
                      },
                      nextSlide: { 
                        aspectRatio: '4/5',
                        width: '5/12',
                        scale: 1
                      },
                      autoHeight: false,
                      showNavigation: false,
                      showPagination: false,
                      transitionDuration: 800,
                      autoPlay: true,
                      autoPlayInterval: 5000
                    }}
                  />
                </div>
              </>
            )}
            
            {/* Loading indicator */}
            {isLoadingMore && (
              <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded z-20">
                載入更多圖片...
              </div>
            )}
          </div>
        )}
        
        {/* Project Info */}
        <div className="pt-8 lg:p-6 flex-1 flex flex-col justify-end">
          <div className="mb-4 flex items-end justify-start space-x-8">
            <h4 className="text-main-title-mobile lg:text-main-title-desktop font-bold text-gray-900 tracking-[0.25em]">
              {project.title}
            </h4>
            <div className="text-sub-title-mobile lg:text-sub-title-desktop text-primary-more font-medium">
              / {project.year || '---'}
            </div>
          </div>
          
          {/* Project Details */}
          <div className="space-y-3 text-content-mobile lg:text-content-desktop">
            {/* Basic Project Information */}
            {project.base_address && (
              <div className="flex justify-start space-x-4 border-b border-primary-line pb-1 text-black tracking-widest">
                <span className="w-[6.25em]">基地位置</span>
                <span className="font-medium">{project.base_address}</span>
              </div>
            )}
            {project.area && (
              <div className="flex justify-start space-x-4 border-b border-primary-line pb-1 text-black tracking-widest">
                <span className="w-[6.25em]">基地面積</span>
                <span className="font-medium">{project.area}</span>
              </div>
            )}
            {project.unit_count && (
              <div className="flex justify-start space-x-4 border-b border-primary-line pb-1 text-black tracking-widest">
                <span className="w-[6.25em]">總戶數</span>
                <span className="font-medium">{project.unit_count} 戶</span>
              </div>
            )}
            {project.floor_plan_info && (
              <div className="flex justify-start space-x-4 border-b border-primary-line pb-1 text-black tracking-widest">
                <span className="w-[6.25em]">格局資訊</span>
                <span className="font-medium">{project.floor_plan_info}</span>
              </div>
            )}
            {project.booking_phone && (
              <div className="flex justify-start space-x-4 border-b border-primary-line pb-1 text-black tracking-widest">
                <span className="w-[6.25em]">預約專線</span>
                <span className="font-medium">{project.booking_phone}</span>
              </div>
            )}
            
            {/* Info Website */}
            {project.info_website && (
              <div className="flex justify-start space-x-4 border-b border-primary-line pb-1 text-black tracking-widest">
                <span className="w-[6.25em]">專案網站</span>
                <span className="font-medium">
                  <a 
                    href={project.info_website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-more hover:underline"
                  >
                    {project.info_website}
                  </a>
                </span>
              </div>
            )}
            
            {/* Facebook Page */}
            {project.facebook_page && (
              <div className="flex justify-start space-x-4 border-b border-primary-line pb-1 text-black tracking-widest">
                <span className="w-[6.25em]">Facebook</span>
                <span className="font-medium">
                  <a 
                    href={project.facebook_page} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-more hover:underline"
                  >
                    Facebook 專頁
                  </a>
                </span>
              </div>
            )}
            
            {/* Subtitle */}
            {project.subtitle && (
              <div className="flex justify-start space-x-4 border-b border-primary-line pb-1 text-black tracking-widest">
                <span className="w-[6.25em]">副標題</span>
                <span className="font-medium">{project.subtitle}</span>
              </div>
            )}
            
            {/* Description */}
            {project.description && (
              <div className="flex justify-start space-x-4 border-b border-primary-line pb-1 text-black tracking-widest">
                <span className="w-[6.25em]">專案描述</span>
                <span className="font-medium">{project.description}</span>
              </div>
            )}
            
            {/* Status Display */}
            {project.status && (
              <div className="!hidden justify-start space-x-4 border-b border-primary-line pb-1 text-black tracking-widest">
                <span className="w-[6.25em]">專案狀態</span>
                <span className="font-medium">
                  {project.status === 'planning' && '籌備中'}
                  {project.status === 'pre_sale' && '預售'}
                  {project.status === 'on_sale' && '銷售中'}
                  {project.status === 'sold_out' && '完銷'}
                  {project.status === 'completed' && '完工'}
                </span>
              </div>
            )}

            {/* Custom Fields */}
            {currentProject.custom_fields && currentProject.custom_fields.length > 0 && (
              <>
                {currentProject.custom_fields.map((field, index) => (
                  field.value && (
                    <div key={index} className="flex justify-start space-x-4 border-b border-primary-line pb-1 text-black tracking-widest">
                      <span className="w-[6.25em]">{field.label}</span>
                      <span className="font-medium">{field.value}</span>
                    </div>
                  )
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  
  // Simplified lazy loading states
  const [projectDetails, setProjectDetails] = useState<Record<string, Project>>({});
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());

  const BANNER_HEIGHT = 288;

  useEffect(() => {
    // Prevent multiple calls during development strict mode
    let mounted = true;
    
    const loadData = async () => {
      if (mounted) {
        await loadProjects();
      }
    };
    
    loadData();
    
    // Check if there's a project UUID in the URL hash and scroll to it
    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#project-')) {
        const projectId = hash.replace('#project-', '');
        setTimeout(() => {
          const element = document.getElementById(`project-${projectId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 1000); // Wait for projects to load
      }
    };

    // Check hash on mount and when hash changes
    handleHashScroll();
    window.addEventListener('hashchange', handleHashScroll);
    
    return () => {
      mounted = false;
      window.removeEventListener('hashchange', handleHashScroll);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadProjects = async (retryCount = 0) => {
    try {
      setLoading(true);
      const response = await projectService.getProjects({
        display_page: '澤暘作品'
      });
      
      if (response.success && response.data?.items) {
        setProjects(response.data.items);
        setError(null);
      } else {
        setError('專案列表載入失敗');
      }
    } catch (err: any) {
      console.error('Failed to load projects:', err);
      
      // Handle rate limiting with retry
      if (err.response?.status === 429 && retryCount < 2) {
        console.log(`Rate limited, retrying in ${(retryCount + 1) * 5} seconds...`);
        setError(`請求過於頻繁，${(retryCount + 1) * 5} 秒後重試...`);
        
        setTimeout(() => {
          loadProjects(retryCount + 1);
        }, (retryCount + 1) * 5000);
        return;
      }
      
      if (err.response?.status === 429) {
        setError('請求過於頻繁，請稍後再試');
      } else {
        setError('載入專案時發生錯誤');
      }
    } finally {
      if (!error || !error.includes('重試')) {
        setLoading(false);
      }
    }
  };

  // Simplified lazy loading function
  const loadProjectDetails = useCallback(async (projectUuid: string) => {
    // Skip if already loaded or loading
    if (projectDetails[projectUuid] || loadingDetails.has(projectUuid)) {
      return;
    }

    try {
      setLoadingDetails(prev => new Set(prev).add(projectUuid));
      
      const response = await projectService.getProject(projectUuid);
      
      if (response.success && response.data?.project) {
        setProjectDetails(prev => ({
          ...prev,
          [projectUuid]: response.data!.project
        }));
      }
    } catch (err) {
      console.error(`Failed to load details for project ${projectUuid}:`, err);
    } finally {
      setLoadingDetails(prev => {
        const newSet = new Set(prev);
        newSet.delete(projectUuid);
        return newSet;
      });
    }
  }, [projectDetails, loadingDetails]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">載入中...</div>
      </div>
    );
  }

  if (error && !error.includes('重試')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">{error}</div>
          <button 
            onClick={() => loadProjects(0)}
            className="px-4 py-2 bg-[#D19B4C] text-white rounded hover:bg-[#C18B3C] transition-colors"
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  const bannerConfig = {
    logoSection: {
      iconSrc: "/images/logo-icon-brand.svg",
      iconAlt: "澤暘建設",
      subtitle: "CLASSIC PROJECTS",
      title: "澤暘作品"
    },
    centralContent: {
      text: "澤暘建築雕琢的不只是生活\n更是一座城市的文化居所，是美學與工藝的時代之作"
    },
    backgroundImage: "/images/project/top-bn-project.jpg"
  };

  return (
    <div className="min-h-screen bg-white" style={{ touchAction: 'pan-y' }}>
      {/* Top Banner Section */}
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

      {/* Projects List Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-12 relative">
          {/* Section Title */}
          <div className="text-left relative lg:absolute top-0 left-0 pl-4 lg:pl-12 z-20 mb-16 lg:mb-0">
            <h2 className="text-gray-400 text-main-large-title-mobile lg:text-main-large-title-desktop font-thin">#PROJECTS</h2>
          </div>

          {/* Projects Grid */}
          {projects.length > 0 ? (
            <div className="flex flex-wrap flex-col gap-8 lg:gap-16">
              {projects.map((project, index) => (
                <ProjectCard 
                  key={project.uuid} 
                  project={project}
                  projectDetails={projectDetails}
                  loadingDetails={loadingDetails}
                  loadProjectDetails={loadProjectDetails}
                  isReversed={index % 2 === 1}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">目前暫無專案資料</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProjectsPage;