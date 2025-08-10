import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({ isOpen, onClose }) => {
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  const menuItems = [
    { title: '關於澤暘', subtitle: 'ABOUT ZY', path: '/about' },
    { title: '開發專區', subtitle: 'LAND DEVELOPMENT', path: '/development' },
    { title: '澤暘團隊', subtitle: 'PARTNERS WITH US', path: '/team' },
    { title: '聯絡我們', subtitle: 'CONTACT US', path: '/contact' },
    { title: '澤暘作品', subtitle: 'CLASSIC PROJECTS', path: '/projects' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Menu Panel - slides from right - Full screen */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.4, ease: 'easeInOut' }}
            className="fixed top-0 right-0 h-full w-full bg-primary z-40 overflow-hidden"
          >
            <div className="h-full flex p-16 xl:p-20 gap-24 2xl:gap-48">
              {/* Left Content Area */}
              <div className="flex flex-col">
                {/* Content wrapper with max width */}
                <div className="w-full lg:max-w-fit">
                  {/* Logo */}
                  <div className="mb-8 lg:mb-16">
                    <img 
                      src="/images/logo-full-brand.svg" 
                      alt="澤暘建設" 
                      className="h-16 w-full filter brightness-0 invert object-contain object-left"
                    />
                  </div>

                  {/* Menu Items - Desktop 2 columns layout */}
                  <nav>
                    <ul className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 lg:gap-y-12">
                    {menuItems.map((item, index) => (
                      <motion.li
                        key={item.path}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                      >
                        <Link
                          to={item.path}
                          onClick={onClose}
                          className="block group"
                        >
                          <div className="flex flex-col items-end">
                            <h3 className="text-white text-2xl xl:text-4xl font-medium mb-2 group-hover:translate-x-4 transition-transform duration-300 text-right">
                              {item.title}
                            </h3>
                            <p className="text-black text-xs xl:text-sm uppercase tracking-wider text-right w-full">
                              {item.subtitle}
                            </p>
                          </div>
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </nav>
                </div>
              </div>

              {/* Right Image Area */}
              <div className="hidden lg:block flex-1 relative">
                <div className="absolute inset-0 flex">
                  <div className="relative h-full w-full max-w-[75%]">
                    {/* Image placeholder - in real app, use actual building image */}
                    <div className="h-full w-full bg-gradient-to-br from-neutral-300 to-neutral-400">
                      <img 
                        src="/images/building-hero.jpg" 
                        alt="澤暘建築" 
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-light/30 to-transparent" />
                  </div>
                </div>

                {/* ZEYANG Text positioned on the right edge of image */}
                <div className="absolute right-[20%] top-1/2 -translate-y-1/2">
                  <div className="relative">
                    {/* First shadow layer */}
                    <p 
                      className="absolute text-6xl xl:text-8xl font-bold leading-none"
                      style={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        transform: 'translateX(50%)',
                        letterSpacing: '0.1em',
                        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, white 100%)',
                        maskImage: 'linear-gradient(to right, transparent 0%, white 100%)',
                        color: 'rgba(255, 255, 255, 0.3)'
                      }}
                    >
                      ZEYANG
                    </p>
                    {/* Second shadow layer - further right */}
                    <p 
                      className="absolute text-6xl xl:text-8xl font-bold leading-none"
                      style={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        transform: 'translateX(100%)',
                        letterSpacing: '0.1em',
                        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, white 100%)',
                        maskImage: 'linear-gradient(to right, transparent 0%, white 100%)',
                        color: 'rgba(255, 255, 255, 0.15)'
                      }}
                    >
                      ZEYANG
                    </p>
                    {/* Main text */}
                    <p 
                      className="relative text-6xl xl:text-8xl font-bold text-white leading-none"
                      style={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        letterSpacing: '0.1em'
                      }}
                    >
                      ZEYANG
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NavigationMenu;