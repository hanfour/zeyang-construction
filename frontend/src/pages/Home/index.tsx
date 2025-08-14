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
        <title>EstateHub - 專業的房地產展示平台</title>
        <meta name="description" content="探索最優質的房地產專案，從豪華住宅到商業大樓，找到您理想的投資機會。" />
      </Helmet>
      <Hero />
      {/* 統一的動畫區塊：築夢、精工、永續、經典 */}
      <AnimatedSections />
      {/* Hero 區塊 - 獨立於動畫容器外 */}
      <HeroSection />
      {/* 熱銷個案輪播區塊 */}
      <HotProjects />
      
      
      {/* <HotCategories />
      <FeaturedProjects />
      <Features />
      <CTA /> */}
    </>
  );
};

export default HomePage;