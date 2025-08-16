import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const handleNavClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-neutral-100">
      <div className="mx-auto">
        <div className="flex flex-col lg:flex-row">
          {/* Left Section */}
          <div className="flex-1 flex flex-col 2xl:flex-row bg-[#c6c6c6] gap-16 pt-8 lg:pt-24 pb-8 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32">
            {/* Logo */}
            <div className="flex-1 mb-8 lg:mb-0">
              <div className="flex items-center justify-center lg:justify-start">
                <Link to="/" onClick={handleNavClick}>
                  <img 
                    src="/images/logo-full-brand.svg" 
                    alt="澤暘建設股份有限公司" 
                    className="h-6 sm:h-8 lg:h-10 w-auto"
                  />
                </Link>
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 space-y-4 lg:space-y-6">
              {/* Links */}
              <div className='flex justify-center lg:justify-end mb-6 lg:mb-32'>
                <div className="flex flex-wrap gap-1 sm:gap-6 lg:gap-8 items-center text-content-mobile lg:text-content-desktop justify-center lg:justify-end">
                  <Link to="/about" onClick={handleNavClick} className="text-neutral-600 hover:text-primary transition-colors">
                    關於澤暘
                  </Link>
                  <div className="w-px h-4 bg-neutral-400 lg:hidden"></div>
                  <Link to="/team" onClick={handleNavClick} className="text-neutral-600 hover:text-primary transition-colors">
                    澤暘團隊
                  </Link>
                  <div className="w-px h-4 bg-neutral-400 lg:hidden"></div>
                  <Link to="/projects" onClick={handleNavClick} className="text-neutral-600 hover:text-primary transition-colors">
                    澤暘作品
                  </Link>
                  <div className="w-px h-4 bg-neutral-400 lg:hidden"></div>
                  <Link to="/development" onClick={handleNavClick} className="text-neutral-600 hover:text-primary transition-colors">
                    開發專區
                  </Link>
                  <div className="w-px h-4 bg-neutral-400 lg:hidden"></div>
                  <Link to="/contact" onClick={handleNavClick} className="text-neutral-600 hover:text-primary transition-colors">
                    聯絡我們
                  </Link>
                </div>
              </div>

              {/* Phone */}
              <div className="text-main-title-mobile lg:text-main-title-desktop font-black text-neutral-600 text-center lg:text-right">
                <p className="relative inline-block">
                  02-2736-8955
                  <span className="absolute bottom-1 left-0 w-full h-[0.3em] bg-[#c8a063]"></span>
                  <span className="absolute bottom-0 left-0 w-full">02-2736-8955</span>
                </p>
              </div>

              {/* Address */}
              <div className="text-content-mobile lg:text-content-desktop text-neutral-600 text-center lg:text-right">
                <p>台北市大安區安和路二段213號3樓之2</p>
              </div>

              {/* Copyright */}
              <div className="text-[8px] lg:text-xs text-neutral-500 text-center lg:text-right">
                <p>© COPYRIGHT ZE YANG. ALL RIGHTS RESERVED</p>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <Link to="/contact" onClick={handleNavClick} className="flex-shrink-0 flex flex-col items-center space-y-4 w-full lg:w-48 bg-primary py-8 lg:py-0 lg:border-s-[2px] lg:border-white hover:bg-[#d4b672] transition-colors duration-300 cursor-pointer">
            {/* Contact Icon */}
            <div className="pt-4 lg:pt-24">
              <img 
                src="/images/icons/icon-contact.png" 
                alt="Contact" 
                className="h-10 w-10 sm:h-12 sm:w-12 transition-transform duration-300 hover:scale-110"
              />
            </div>

            {/* CONTACT Us */}
            <div className="text-center">
              <p className="text-xs lg:text-sm font-medium text-neutral-700">CONTACT US</p>
            </div>

            {/* Vertical Text */}
            <div className="hidden lg:flex flex-col items-center">
              <div className="text-main-title-mobile lg:text-main-title-desktop font-semibold text-neutral-700" style={{writingMode: 'vertical-rl', textOrientation: 'mixed', letterSpacing: '0.4em'}}>
                與我們聯繫
              </div>
            </div>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;