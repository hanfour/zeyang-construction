import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Hero from './components/Hero';
import DreamSection from './components/DreamSection';
import HotCategories from './components/HotCategories';
import FeaturedProjects from './components/FeaturedProjects';
import Features from './components/Features';
import CTA from './components/CTA';

const HomePage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>EstateHub - 專業的房地產展示平台</title>
        <meta name="description" content="探索最優質的房地產專案，從豪華住宅到商業大樓，找到您理想的投資機會。" />
      </Helmet>
      
      <Hero />
      <DreamSection />
      <HotCategories />
      <FeaturedProjects />
      <Features />
      <CTA />
    </>
  );
};

export default HomePage;