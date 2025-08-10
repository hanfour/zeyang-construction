import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="flex items-center">
              <span className={`text-3xl font-bold ${isScrolled ? 'text-primary' : 'text-white'}`}>
                ZY
              </span>
              <div className={`ml-3 ${isScrolled ? 'text-neutral-700' : 'text-white'}`}>
                <p className="text-sm font-medium leading-tight">澤暘建設股份有限公司</p>
                <p className="text-xs opacity-80">Ze Yang Construction Co., Ltd.</p>
              </div>
            </div>
          </Link>

          {/* Navigation - Desktop Only */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link 
              to="/about" 
              className={`font-medium transition-colors hover:text-primary ${
                isScrolled ? 'text-neutral-700' : 'text-white'
              }`}
            >
              關於澤暘
            </Link>
            <Link 
              to="/projects" 
              className={`font-medium transition-colors hover:text-primary ${
                isScrolled ? 'text-neutral-700' : 'text-white'
              }`}
            >
              澤暘作品
            </Link>
            <Link 
              to="/development" 
              className={`font-medium transition-colors hover:text-primary ${
                isScrolled ? 'text-neutral-700' : 'text-white'
              }`}
            >
              開發專區
            </Link>
            <Link 
              to="/team" 
              className={`font-medium transition-colors hover:text-primary ${
                isScrolled ? 'text-neutral-700' : 'text-white'
              }`}
            >
              澤暘團隊
            </Link>
            <Link 
              to="/contact" 
              className={`font-medium transition-colors hover:text-primary ${
                isScrolled ? 'text-neutral-700' : 'text-white'
              }`}
            >
              聯絡我們
            </Link>
            
            {isAuthenticated && (user?.role === 'admin' || user?.role === 'editor') && (
              <Link
                to="/admin"
                className={`font-medium transition-colors hover:text-primary ${
                  isScrolled ? 'text-neutral-700' : 'text-white'
                }`}
              >
                管理後台
              </Link>
            )}
          </nav>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;