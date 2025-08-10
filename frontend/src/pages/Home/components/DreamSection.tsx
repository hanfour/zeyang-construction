import React from 'react';

const DreamSection: React.FC = () => {
  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="/images/dream-bg.jpg" 
          alt="築夢背景" 
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            // Fallback to gradient background if image fails to load
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* Fallback gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-amber-100" />
        
        {/* Dark overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content Container */}
      <div className="relative h-full flex items-center z-10">
        {/* Text content positioned 25% from left */}
        <div className="ml-[25%] flex items-start space-x-12 h-full pt-20">
          {/* Left side - Vertical title */}
          <div className="flex items-start justify-start h-full">
            <h2 
              className="text-6xl md:text-7xl lg:text-8xl font-bold text-primary tracking-wider"
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'upright',
                letterSpacing: '0.2em'
              }}
            >
              築夢。
            </h2>
          </div>
          
          {/* Right side - Subtitle and content */}
          <div className="max-w-md pt-4">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-800 mb-6 leading-relaxed">
              築一座能安放幸福的家
            </h3>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
              建築的起點，從一磚一瓦開始，用心描繪出對未來的想像
              <br /><br />
              從晨光灑落的餐桌，到深夜仍亮著的燈火
              <br /><br />
              從家人間的歡聲笑語，到細水長流的溫馨
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DreamSection;