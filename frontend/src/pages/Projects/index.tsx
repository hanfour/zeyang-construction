import React, { useState, useEffect } from 'react';
import projectService from '@/services/project.service';
import { Project } from '@/types';
import { getImageUrl } from '@/utils/image';
import MenuButton from '@/components/Layout/MenuButton';
import NavigationMenu from '@/components/Layout/NavigationMenu';

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const BANNER_HEIGHT = 288; // h-72 = 288px

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getProjects();
      
      if (response.success && response.data?.items) {
        setProjects(response.data.items);
        setError(null);
      } else {
        setError('專案列表載入失敗');
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('載入專案時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">載入中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-white">
      {/* Top Banner Section */}
      <section 
        className="relative h-72 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/project/top-bn-project.jpg')"
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        {/* Header */}
        <div className="relative z-20 p-4 lg:p-12">
          {/* Logo Section */}
          <div className="mb-8">
            <div className="flex items-center">
              <img 
                src="/images/logo-icon-brand.svg" 
                alt="澤暘建設" 
                className="h-10 w-auto mr-4 filter brightness-0 invert"
              />
              <div>
                <p className="text-white text-sm tracking-wider">CLASSIC PROJECTS</p>
                <h1 className="text-white text-sm tracking-wider">澤暘作品</h1>
              </div>
            </div>
          </div>
        </div>

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
        
        {/* Central Content */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center text-white px-4">
            <p className="text-content-mobile lg:text-content-desktop leading-relaxed font-noraml tracking-wide">
              澤暘建築雕琢的不只是生活<br/>更是一座城市的文化居所，是美學與工藝的時代之作 
            </p>
          </div>
        </div>
      </section>

      {/* Projects List Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-12">
          {/* Section Title */}
          <div className="mb-16 text-left">
            <h2 className="text-gray-400 text-main-large-title-mobile lg:text-main-large-title-desktop font-thin">#PROJECTS</h2>
          </div>

          {/* Projects Grid */}
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              {projects.map((project) => {
                const galleryImages = project.images?.filter(img => img.image_type !== 'main') || [];
                const leftImage = galleryImages[0];
                const rightImage = galleryImages[1];
                
                return (
                  <div key={project.uuid} className="group">
                    {/* Project Card */}
                    <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                      {/* Main Image */}
                      {project.main_image && (
                        <div className="aspect-[4/3] overflow-hidden">
                          <img 
                            src={getImageUrl(project.main_image.file_path)} 
                            alt={`${project.title} 主要圖片`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}
                      
                      {/* Project Info */}
                      <div className="p-6">
                        <div className="mb-4">
                          <h4 className="text-2xl font-bold text-gray-900 mb-2">
                            {project.title}
                          </h4>
                          <div className="text-lg text-[#D19B4C] font-medium">
                            / {project.year || '---'}
                          </div>
                        </div>
                        
                        {/* Project Details */}
                        <div className="space-y-3 text-sm">
                          {project.base_address && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">基地位置</span>
                              <span className="font-medium text-gray-900">{project.base_address}</span>
                            </div>
                          )}
                          {project.area && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">基地面積</span>
                              <span className="font-medium text-gray-900">{project.area}</span>
                            </div>
                          )}
                          {project.unit_count && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">總戶數</span>
                              <span className="font-medium text-gray-900">{project.unit_count} 戶</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Gallery Images */}
                        {(leftImage || rightImage) && (
                          <div className="grid grid-cols-2 gap-2 mt-4">
                            {leftImage && (
                              <div className="aspect-[4/3] overflow-hidden rounded">
                                <img 
                                  src={getImageUrl(leftImage.file_path)} 
                                  alt={leftImage.alt_text || `${project.title} 圖片`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            {rightImage && (
                              <div className="aspect-[4/3] overflow-hidden rounded">
                                <img 
                                  src={getImageUrl(rightImage.file_path)} 
                                  alt={rightImage.alt_text || `${project.title} 圖片`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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