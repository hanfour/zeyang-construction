import React, { useState, useEffect, useCallback } from 'react';

export interface CarouselImage {
  file_path: string;
  alt?: string;
}

export interface CarouselConfig {
  activeSlide: {
    aspectRatio: string;
    width: string; // e.g., '100%', '8/12', '6/12', '4/12'
  };
  nextSlide: {
    aspectRatio: string;
    width: string; // e.g., '100%', '8/12', '6/12', '4/12'
    scale?: number; // optional scaling
  };
  container: {
    aspectRatio: string;
    alignItems?: 'start' | 'center' | 'end'; // vertical alignment
    gap?: 'gap-0' | 'gap-1' | 'gap-2' | 'gap-3' | 'gap-4' | 'gap-5' | 'gap-6' | 'gap-8' | 'gap-10' | 'gap-12' | 'gap-16'; // spacing between items
    justifyContent?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'; // horizontal alignment
  };
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showNavigation?: boolean;
  showPagination?: boolean;
  autoHeight?: boolean;
  transitionDuration?: number;
  navigationStyle?: {
    size?: 'sm' | 'md' | 'lg';
    position?: 'inside' | 'outside';
    color?: 'light' | 'dark';
  };
  paginationStyle?: {
    position?: 'bottom-left' | 'bottom-center' | 'bottom-right' | 'top-left' | 'top-center' | 'top-right';
    style?: 'dots' | 'bullets' | 'bars';
  };
}

interface CustomCarouselProps {
  images: CarouselImage[];
  config: CarouselConfig;
  className?: string;
  onSlideChange?: (activeIndex: number) => void;
}

const CustomCarousel: React.FC<CustomCarouselProps> = ({
  images,
  config,
  className = '',
  onSlideChange
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [containerHeight, setContainerHeight] = useState<number | null>(null);
  const [imageHeights, setImageHeights] = useState<Record<number, number>>({});
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{
    container: { width: number; height: number };
    active: { width: number; height: number };
    next: { width: number; height: number };
  } | null>(null);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev' | null>(null);

  const nextIndex = (currentIndex + 1) % images.length;
  const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
  const transitionDuration = config.transitionDuration || 300;
  const alignItems = config.container.alignItems || 'start';
  const gap = config.container.gap || 'gap-4';
  const justifyContent = config.container.justifyContent || 'start';
  const autoHeight = config.autoHeight || false;

  const goToNext = useCallback(() => {
    if (isTransitioning || images.length <= 1) return;
    
    setIsTransitioning(true);
    setSlideDirection('next');
    
    setTimeout(() => {
      setCurrentIndex(nextIndex);
      setSlideDirection(null);
      setIsTransitioning(false);
    }, transitionDuration);
    
    onSlideChange?.(nextIndex);
  }, [currentIndex, images.length, isTransitioning, nextIndex, transitionDuration, onSlideChange]);

  const goToPrevious = useCallback(() => {
    if (isTransitioning || images.length <= 1) return;
    
    setIsTransitioning(true);
    setSlideDirection('prev');
    
    setTimeout(() => {
      setCurrentIndex(prevIndex);
      setSlideDirection(null);
      setIsTransitioning(false);
    }, transitionDuration);
    
    onSlideChange?.(prevIndex);
  }, [currentIndex, images.length, isTransitioning, prevIndex, transitionDuration, onSlideChange]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex || index < 0 || index >= images.length) return;
    
    setIsTransitioning(true);
    setCurrentIndex(index);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, transitionDuration);
    
    onSlideChange?.(index);
  }, [currentIndex, images.length, isTransitioning, transitionDuration, onSlideChange]);

  // Image load handler for autoHeight
  const handleImageLoad = useCallback((index: number, event: React.SyntheticEvent<HTMLImageElement>) => {
    // Mark image as loaded
    setImageLoaded(prev => ({
      ...prev,
      [index]: true
    }));
    
    if (!autoHeight) return;
    
    const img = event.currentTarget;
    const imgHeight = img.offsetHeight;
    
    setImageHeights(prev => ({
      ...prev,
      [index]: imgHeight
    }));
    
    // Update container height if this is the current image
    if (index === currentIndex) {
      setContainerHeight(imgHeight);
    }
  }, [autoHeight, currentIndex]);

  // Calculate dimensions based on width and aspect ratios
  const calculateDimensions = useCallback((containerWidth: number) => {
    // Parse aspect ratios
    const parseAspectRatio = (ratio: string) => {
      const [w, h] = ratio.split('/').map(Number);
      return { width: w, height: h };
    };
    
    const containerRatio = parseAspectRatio(config.container.aspectRatio);
    const activeRatio = parseAspectRatio(config.activeSlide.aspectRatio);
    const nextRatio = parseAspectRatio(config.nextSlide.aspectRatio);
    
    // Calculate container height
    const containerHeight = (containerWidth * containerRatio.height) / containerRatio.width;
    
    // Calculate width percentages
    const getWidthPercentage = (width: string) => {
      if (width === '100%') return 1;
      if (width === '0%') return 0;
      if (width.includes('/')) {
        const [numerator, denominator] = width.split('/').map(Number);
        return numerator / denominator;
      }
      return parseFloat(width.replace('%', '')) / 100;
    };
    
    // Calculate active slide dimensions
    const activeWidthRatio = getWidthPercentage(config.activeSlide.width);
    const activeWidth = containerWidth * activeWidthRatio;
    const activeHeight = (activeWidth * activeRatio.height) / activeRatio.width;
    
    // Calculate next slide dimensions  
    const nextWidthRatio = getWidthPercentage(config.nextSlide.width);
    const nextWidth = containerWidth * nextWidthRatio;
    const nextHeight = nextWidth > 0 ? (nextWidth * nextRatio.height) / nextRatio.width : 0;
    
    return {
      container: { width: containerWidth, height: containerHeight },
      active: { width: activeWidth, height: activeHeight },
      next: { width: nextWidth, height: nextHeight }
    };
  }, [config]);

  // Update dimensions when container width changes
  useEffect(() => {
    if (!containerRef || autoHeight) return;
    
    const updateDimensions = () => {
      const containerWidth = containerRef.offsetWidth;
      const calculatedDimensions = calculateDimensions(containerWidth);
      setDimensions(calculatedDimensions);
      // Use active slide height as container height since it's the main content
      setContainerHeight(calculatedDimensions.active.height);
    };
    
    updateDimensions();
    
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef);
    
    return () => resizeObserver.disconnect();
  }, [containerRef, calculateDimensions, autoHeight]);

  // Update container height when current index changes (for autoHeight mode)
  useEffect(() => {
    if (!autoHeight) return;
    
    const currentImageHeight = imageHeights[currentIndex];
    if (currentImageHeight) {
      setContainerHeight(currentImageHeight);
    }
  }, [currentIndex, imageHeights, autoHeight]);


  // Auto play functionality
  useEffect(() => {
    if (!config.autoPlay || images.length <= 1) return;

    const interval = setInterval(() => {
      goToNext();
    }, config.autoPlayInterval || 5001);

    return () => clearInterval(interval);
  }, [config.autoPlay, config.autoPlayInterval, goToNext, images.length]);


  // Helper function to get flex alignment class
  const getAlignItemsClass = () => {
    switch (alignItems) {
      case 'start': return 'items-start';
      case 'center': return 'items-center';
      case 'end': return 'items-end';
      default: return 'items-start';
    }
  };

  // Helper function to get justify content class
  const getJustifyContentClass = () => {
    switch (justifyContent) {
      case 'start': return 'justify-start';
      case 'end': return 'justify-end';
      case 'center': return 'justify-center';
      case 'between': return 'justify-between';
      case 'around': return 'justify-around';
      case 'evenly': return 'justify-evenly';
      default: return 'justify-start';
    }
  };


  // Helper function to get navigation button styles
  const getNavigationStyles = () => {
    const navStyle = config.navigationStyle || {};
    const size = navStyle.size || 'md';
    const color = navStyle.color || 'light';
    
    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12'
    };
    
    const colorClasses = {
      light: 'bg-white/80 hover:bg-white text-gray-600',
      dark: 'bg-black/80 hover:bg-black text-white'
    };
    
    return `${sizeClasses[size]} ${colorClasses[color]} rounded-full flex items-center justify-center transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`;
  };

  // Helper function to get pagination styles and position
  const getPaginationClasses = () => {
    const paginationStyle = config.paginationStyle || {};
    const position = paginationStyle.position || 'bottom-left';
    const style = paginationStyle.style || 'dots';
    
    const positionClasses = {
      'bottom-left': 'absolute bottom-4 left-4',
      'bottom-center': 'absolute bottom-4 left-1/2 transform -translate-x-1/2',
      'bottom-right': 'absolute bottom-4 right-4',
      'top-left': 'absolute top-4 left-4',
      'top-center': 'absolute top-4 left-1/2 transform -translate-x-1/2',
      'top-right': 'absolute top-4 right-4'
    };
    
    return {
      container: `${positionClasses[position]} z-10 flex space-x-2`,
      button: style === 'bars' ? 'w-6 h-1 rounded-full' : 'w-2 h-2 rounded-full'
    };
  };

  if (images.length === 0) {
    return <div className={`bg-gray-200 ${className}`} style={{ aspectRatio: config.container.aspectRatio }} />;
  }

  if (images.length === 1) {
    return (
      <div 
        ref={setContainerRef}
        className={`relative overflow-hidden ${className}`} 
        style={{ 
          height: containerHeight ? `${containerHeight}px` : undefined,
          transition: `height ${transitionDuration}ms ease-in-out`,
        }}
      >
        <img
          src={images[0].file_path}
          alt={images[0].alt || ''}
          className="w-full h-full object-cover"
          onLoad={(e) => handleImageLoad(0, e)}
          style={{
            display: 'block',
          }}
        />
      </div>
    );
  }

  return (
    <div 
      ref={setContainerRef}
      className={`relative overflow-hidden flex ${gap} ${getAlignItemsClass()} ${getJustifyContentClass()} ${className}`}
      style={{
        height: containerHeight ? `${containerHeight}px` : undefined,
        transition: `height ${transitionDuration}ms ease-in-out`,
        touchAction: 'pan-y', // Allow vertical scrolling but prevent horizontal gestures
      }}
    >
      {/* Active Slide with Slide Animation */}
      <div
        className="overflow-hidden flex-shrink-0 relative"
        style={{
          width: dimensions ? `${dimensions.active.width}px` : '100%',
          height: dimensions ? `${dimensions.active.height}px` : '100%',
        }}
      >
        {/* Main Image Display */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 group-hover:scale-105 ${
            imageLoaded[currentIndex] ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url(${images[currentIndex].file_path})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {!imageLoaded[currentIndex] && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-[#D19B4C] rounded-full animate-spin"></div>
            </div>
          )}
          {/* Hidden img for loading detection */}
          <img
            src={images[currentIndex].file_path}
            alt={images[currentIndex].alt || `Slide ${currentIndex + 1}`}
            className="hidden"
            onLoad={(e) => handleImageLoad(currentIndex, e)}
          />
        </div>

        {/* Sliding Image (shown during transition) */}
        {isTransitioning && slideDirection && (
          <div
            className="absolute inset-0 transition-transform ease-in-out"
            style={{
              transitionDuration: `${transitionDuration}ms`,
              transform: slideDirection === 'next' 
                ? 'translateX(-100%)' 
                : 'translateX(100%)',
              backgroundImage: `url(${images[slideDirection === 'next' ? nextIndex : prevIndex].file_path})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              left: slideDirection === 'next' ? '100%' : '-100%',
            }}
          />
        )}
      </div>

      {/* Next Slide Preview with animation */}
      {config.nextSlide.width !== '0%' && dimensions && dimensions.next.width > 0 && (
        <div
          className="overflow-hidden flex-shrink-0 relative"
          style={{
            width: `${dimensions.next.width}px`,
            height: `${dimensions.next.height}px`,
          }}
        >
          {/* Simple Preview Display */}
          <div
            className={`hover:opacity-90 cursor-pointer transition-all duration-300 hover:scale-105 ${
              imageLoaded[nextIndex] ? 'opacity-80' : 'opacity-0'
            }`}
            style={{
              width: `${dimensions.next.width}px`,
              height: `${dimensions.next.height}px`,
              transform: config.nextSlide.scale ? `scale(${config.nextSlide.scale})` : undefined,
              transformOrigin: 'top',
              backgroundImage: `url(${images[nextIndex].file_path})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
            onClick={goToNext}
          >
            {!imageLoaded[nextIndex] && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
            )}
            {/* Hidden img for loading detection */}
            <img
              src={images[nextIndex].file_path}
              alt={images[nextIndex].alt || `Slide ${nextIndex + 1}`}
              className="hidden"
              onLoad={(e) => handleImageLoad(nextIndex, e)}
            />
          </div>
        </div>
      )}

      {/* Navigation Arrows */}
      {config.showNavigation && (
        <>
          <button
            onClick={goToPrevious}
            disabled={isTransitioning}
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-10 ${getNavigationStyles()}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={goToNext}
            disabled={isTransitioning}
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 z-10 ${getNavigationStyles()}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Pagination */}
      {config.showPagination && (() => {
        const paginationClasses = getPaginationClasses();
        return (
          <div className={paginationClasses.container}>
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className={`${paginationClasses.button} transition-colors duration-200 ${
                  index === currentIndex 
                    ? 'bg-[#D19B4C]' 
                    : 'bg-gray-400 hover:bg-gray-600'
                } disabled:cursor-not-allowed`}
              />
            ))}
          </div>
        );
      })()}
    </div>
  );
};

export default CustomCarousel;