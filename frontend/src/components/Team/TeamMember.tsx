import React from 'react';

interface TeamMemberProps {
  logoSrc: string;
  logoAlt: string;
  title: string;
  description: string;
  category: string;
  isLast?: boolean;
}

const TeamMember: React.FC<TeamMemberProps> = ({
  logoSrc,
  logoAlt,
  title,
  description,
  category,
  isLast = false
}) => {
  return (
    <div className={`group relative flex flex-col md:flex-row items-center gap-5 md:gap-12 xl:gap-16 pb-6 2xl:pb-16 pt-10 2xl:pt-20 px-12 border-t border-primary-line cursor-pointer ${isLast ? 'border-b' : ''}`}>
      {/* Hover overlay with curtain animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-300 to-primary-50 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
      </div>
      
      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-5 md:gap-12 xl:gap-16 w-full">
        <div className="w-full md:w-1/5 flex-shrink-0 flex justify-center items-center">
          <img 
            src={logoSrc}
            alt={logoAlt}
            className="h-20 w-auto object-contain"
          />
        </div>
        <div className="flex-1 relative">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-main-title-mobile lg:text-main-title-desktop font-bold text-primary-more leading-6 mb-2">
                {title}
              </h3>
              <p className="text-black text-content-mobile lg:text-content-desktop leading-relaxed text-justify">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Category tag */}
      <div className="absolute top-0 right-0 w-full flex justify-end items-center z-20">
        <p className="absolute top-[50%] -translate-y-1/2 bg-[#c4a26f] text-white text-xs font-medium px-2 py-1">
          {category}
        </p>
      </div>
    </div>
  );
};

export default TeamMember;