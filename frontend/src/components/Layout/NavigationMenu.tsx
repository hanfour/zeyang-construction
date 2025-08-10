import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({ isOpen, onClose }) => {
  const [animationKey, setAnimationKey] = React.useState(0);
  // Prevent scroll and compensate for scrollbar width to avoid layout shift
  useEffect(() => {
    if (isOpen) {
      // Calculate scrollbar width before hiding it
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Apply styles to prevent scroll and compensate width
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      // Also apply to fixed elements to prevent them from shifting
      const fixedElements = document.querySelectorAll('.fixed');
      fixedElements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        htmlElement.style.paddingRight = `${scrollbarWidth}px`;
      });
    } else {
      // Reset styles
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
      
      // Reset fixed elements
      const fixedElements = document.querySelectorAll('.fixed');
      fixedElements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        htmlElement.style.paddingRight = '0px';
      });
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
      
      const fixedElements = document.querySelectorAll('.fixed');
      fixedElements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        htmlElement.style.paddingRight = '0px';
      });
    };
  }, [isOpen]);

  // Reset animation key when opening to ensure fresh animations
  React.useEffect(() => {
    if (isOpen) {
      setAnimationKey(prev => prev + 1);
    }
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
            transition={{ 
              duration: 0.3,
              ease: 'easeInOut'
            }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Menu Panel - slides from right with enhanced transitions */}
          <motion.div
            initial={{ 
              x: '100%',
              visibility: 'hidden'
            }}
            animate={{ 
              x: 0,
              visibility: 'visible'
            }}
            exit={{ 
              x: '100%',
              visibility: 'hidden'
            }}
            transition={{ 
              x: { 
                type: 'tween', 
                duration: 0.4, 
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: 0 // No delay on enter
              },
              visibility: { 
                duration: 0.001,
                ease: 'linear'
              }
            }}
            variants={{
              exit: {
                x: '100%',
                visibility: 'hidden',
                transition: {
                  x: {
                    type: 'tween',
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    delay: 0.12 // Wait for text to fade out (0.1s + small buffer)
                  },
                  visibility: {
                    duration: 0.001,
                    ease: 'linear',
                    delay: 0.52 // After panel slides out
                  }
                }
              }
            }}
            className="fixed top-0 right-0 h-full w-full bg-primary overflow-hidden"
            style={{
              zIndex: isOpen ? 50 : -1,
              transition: isOpen 
                ? 'visibility 1ms ease, z-index 1ms ease' 
                : 'visibility 5ms ease 1s, z-index 5ms ease 1s'
            }}
          >
            <div className="h-full flex flex-col lg:flex-row p-12 xl:p-20 gap-16 lg:gap-24 2xl:gap-48">
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
                    <ul className="grid grid-cols-2 gap-x-4 lg:gap-x-12 gap-y-4 lg:gap-y-12">
                    {menuItems.map((item, index) => (
                      <motion.li
                        key={`${item.path}-${animationKey}`}
                        className="overflow-hidden"
                      >
                        <motion.div
                          initial={{ 
                            x: '100%', // Start completely off-screen to the right
                            opacity: 0
                          }}
                          animate={{ 
                            x: '0%', // Slide to normal position
                            opacity: 1
                          }}
                          exit={{ 
                            opacity: 0, // Just fade out, don't move
                            transition: {
                              duration: 0.1,
                              ease: 'easeOut'
                            }
                          }}
                          transition={{ 
                            delay: 0.5 + index * 0.1, // Wait for background + sequential
                            duration: 0.5,
                            ease: [0.25, 0.46, 0.45, 0.94]
                          }}
                        >
                        <Link
                          to={item.path}
                          onClick={onClose}
                          className="block group"
                        >
                          <div className="flex flex-col items-end">
                            <h3 className="text-white text-base lg:text-2xl xl:text-4xl font-medium mb-2 group-hover:translate-x-4 transition-transform duration-300 text-right">
                              {item.title}
                            </h3>
                            <p className="text-black text-xs xl:text-sm uppercase tracking-wider text-right w-full">
                              {item.subtitle}
                            </p>
                          </div>
                        </Link>
                        </motion.div>
                      </motion.li>
                    ))}
                  </ul>
                </nav>
                </div>
              </div>

              {/* Right Image Area */}
              <div className="block flex-1 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full max-w-[90%] lg:max-w-[75%] aspect-square">
                    {/* Image placeholder - in real app, use actual building image */}
                    <div className="w-full h-full bg-gradient-to-br from-neutral-300 to-neutral-400 relative">
                      <motion.img 
                        key={`image-${animationKey}`}
                        src="/images/building-hero.jpg" 
                        alt="澤暘建築" 
                        className="h-full w-full object-cover"
                        initial={{ 
                          filter: 'grayscale(100%)' 
                        }}
                        animate={{ 
                          filter: 'grayscale(0%)' 
                        }}
                        exit={{ 
                          filter: 'grayscale(100%)',
                          transition: {
                            duration: 0.1,
                            ease: 'easeOut'
                          }
                        }}
                        transition={{ 
                          delay: 1.0, // After background and some text items appear
                          duration: 0.8,
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-light/30 to-transparent" />
                    </div>
                  </div>
                </div>

                {/* ZEYANG Text positioned on the right edge of image */}
                <div className="absolute right-[5%] lg:right-[20%] top-1/2 -translate-y-1/2">
                  <div className="relative">
                    {/* First shadow layer */}
                    <p 
                      className="absolute text-5xl lg:text-6xl xl:text-8xl font-bold leading-none"
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
                      className="absolute text-5xl lg:text-6xl xl:text-8xl font-bold leading-none"
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
                      className="relative text-5xl lg:text-6xl xl:text-8xl font-bold text-white leading-none"
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