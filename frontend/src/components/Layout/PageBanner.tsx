import React from 'react';

export interface PageBannerConfig {
  // Logo section configuration
  logoSection: {
    iconSrc: string;
    iconAlt: string;
    subtitle: string;
    title: string;
  };
  
  // Central content configuration
  centralContent: {
    text: string; // Supports line breaks with \n
  };
  
  // Background configuration
  backgroundImage: string;
  
  // Height configuration (optional)
  height?: string; // Default: 'h-72'
}

interface PageBannerProps {
  config: PageBannerConfig;
  children?: React.ReactNode; // For additional elements like MenuButton, NavigationMenu
}

const PageBanner: React.FC<PageBannerProps> = ({ config, children }) => {
  const { logoSection, centralContent, backgroundImage, height = 'h-72' } = config;

  return (
    <section 
      className={`relative ${height} bg-cover bg-center bg-no-repeat`}
      style={{
        backgroundImage: `url('${backgroundImage}')`
      }}
    >
      {/* Overlay */}
      {/* <div className="absolute inset-0 bg-black bg-opacity-30"></div> */}
      
      {/* Header */}
      <div className="relative z-20 p-4 lg:p-12">
        {/* Logo Section */}
        <div className="mb-8">
          <div className="flex items-center">
            <img 
              src={logoSection.iconSrc}
              alt={logoSection.iconAlt}
              className="h-10 w-auto mr-4 filter brightness-0 invert"
            />
            <div>
              <p className="text-white text-sm tracking-wider">{logoSection.subtitle}</p>
              <h1 className="text-white text-sm tracking-wider">{logoSection.title}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Central Content */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center text-white px-4">
          <p className="text-content-mobile lg:text-content-desktop leading-relaxed font-normal tracking-wide">
            {centralContent.text.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                {index < centralContent.text.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        </div>
      </div>

      {/* Additional children (MenuButton, NavigationMenu, etc.) */}
      {children}
    </section>
  );
};

export default PageBanner;