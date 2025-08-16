import React from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from './components/Hero';
import AnimatedSections from './components/AnimatedSections';
import HeroSection from './components/HeroSection';
import HotProjects from './components/HotProjects';
// import HotCategories from './components/HotCategories';
// import FeaturedProjects from './components/FeaturedProjects';
// import Features from './components/Features';
// import CTA from './components/CTA';

const HomePage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>ZeYang - 匠心築夢築澤暘之境</title>
        <meta name="description" content="澤暘建設秉持「誠信築基、匠心營造」之核心精神，深耕台灣土地多年，以深厚的在地情感，精雕細琢每一建築細節，追求完美居住體驗。澤暘建設相信，好的住宅不僅是建築本身，更是生活價值的延伸與呈現。未來，我們將持續致力於創造符合現代人需求、兼具舒適與美感的生活空間，與每位住戶一同築夢未來。" />
      </Helmet>
      <Hero />
      {/* 統一的動畫區塊：築夢、精工、永續、經典 */}
      <AnimatedSections />
      {/* Hero 區塊 - 獨立於動畫容器外 */}
      <HeroSection />
      {/* 熱銷個案輪播區塊 */}
      <HotProjects />
    </>
  );
};

export default HomePage;