import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import NavigationMenu from './NavigationMenu';
import MenuButton from './MenuButton';

const MainLayout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <MenuButton isOpen={isMenuOpen} onClick={() => setIsMenuOpen(!isMenuOpen)} />
      <NavigationMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      
      <main className="flex-grow">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
};

export default MainLayout;