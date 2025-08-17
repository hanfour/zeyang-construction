import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CustomCarousel, { CarouselConfig, CarouselImage } from '../CustomCarousel';

const mockImages: CarouselImage[] = [
  {
    file_path: '/images/test1.jpg',
    alt: 'Test Image 1'
  },
  {
    file_path: '/images/test2.jpg',
    alt: 'Test Image 2'
  },
  {
    file_path: '/images/test3.jpg',
    alt: 'Test Image 3'
  }
];

const defaultConfig: CarouselConfig = {
  activeSlide: {
    aspectRatio: '16/9',
    width: '8/12'
  },
  nextSlide: {
    aspectRatio: '16/9',
    width: '4/12',
    scale: 0.8
  },
  container: {
    aspectRatio: '21/9',
    alignItems: 'center',
    gap: 'gap-4',
    justifyContent: 'start'
  },
  autoPlay: false,
  showNavigation: true,
  showPagination: true,
  autoHeight: false,
  transitionDuration: 300
};

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock Image loading
const mockImageLoad = () => {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    Object.defineProperty(img, 'offsetHeight', { value: 400 });
    fireEvent.load(img);
  });
};

describe('CustomCarousel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders carousel with images', () => {
    render(<CustomCarousel images={mockImages} config={defaultConfig} />);
    
    // Should render container
    expect(document.querySelector('[style*="background-image"]')).toBeInTheDocument();
  });

  it('renders empty state when no images provided', () => {
    const { container } = render(<CustomCarousel images={[]} config={defaultConfig} />);
    
    // Should render empty state
    expect(container.firstChild).toHaveClass('bg-gray-200');
  });

  it('renders single image without navigation', () => {
    const singleImage = [mockImages[0]];
    render(<CustomCarousel images={singleImage} config={defaultConfig} />);
    
    // Should not render navigation for single image
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders navigation buttons when enabled', () => {
    render(<CustomCarousel images={mockImages} config={defaultConfig} />);
    
    const prevButton = screen.getByRole('button', { name: /previous/i });
    const nextButton = screen.getByRole('button', { name: /next/i });
    
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
  });

  it('renders pagination dots when enabled', () => {
    render(<CustomCarousel images={mockImages} config={defaultConfig} />);
    
    // Should render pagination buttons (one for each image)
    const paginationButtons = screen.getAllByRole('button').filter(
      button => !button.querySelector('svg') // Filter out navigation buttons with arrows
    );
    
    expect(paginationButtons).toHaveLength(mockImages.length);
  });

  it('hides navigation when disabled', () => {
    const configWithoutNavigation = {
      ...defaultConfig,
      showNavigation: false
    };
    
    render(<CustomCarousel images={mockImages} config={configWithoutNavigation} />);
    
    // Should not render navigation arrows
    const arrowButtons = screen.queryAllByRole('button').filter(
      button => button.querySelector('svg')
    );
    
    expect(arrowButtons).toHaveLength(0);
  });

  it('hides pagination when disabled', () => {
    const configWithoutPagination = {
      ...defaultConfig,
      showPagination: false
    };
    
    render(<CustomCarousel images={mockImages} config={configWithoutPagination} />);
    
    // Only navigation buttons should be present (if any)
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2); // Only prev/next buttons
  });

  it('handles next slide navigation', async () => {
    const onSlideChange = jest.fn();
    
    render(
      <CustomCarousel 
        images={mockImages} 
        config={defaultConfig} 
        onSlideChange={onSlideChange}
      />
    );
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(onSlideChange).toHaveBeenCalledWith(1);
    });
  });

  it('handles previous slide navigation', async () => {
    const onSlideChange = jest.fn();
    
    render(
      <CustomCarousel 
        images={mockImages} 
        config={defaultConfig} 
        onSlideChange={onSlideChange}
      />
    );
    
    const prevButton = screen.getByRole('button', { name: /previous/i });
    fireEvent.click(prevButton);
    
    await waitFor(() => {
      expect(onSlideChange).toHaveBeenCalledWith(2); // Should wrap to last slide
    });
  });

  it('handles pagination click', async () => {
    const onSlideChange = jest.fn();
    
    render(
      <CustomCarousel 
        images={mockImages} 
        config={defaultConfig} 
        onSlideChange={onSlideChange}
      />
    );
    
    const paginationButtons = screen.getAllByRole('button').filter(
      button => !button.querySelector('svg')
    );
    
    fireEvent.click(paginationButtons[2]); // Click third pagination button
    
    await waitFor(() => {
      expect(onSlideChange).toHaveBeenCalledWith(2);
    });
  });

  it('prevents navigation during transition', () => {
    const onSlideChange = jest.fn();
    
    render(
      <CustomCarousel 
        images={mockImages} 
        config={defaultConfig} 
        onSlideChange={onSlideChange}
      />
    );
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    
    // Click rapidly
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    
    // Should only trigger once due to transition lock
    expect(onSlideChange).toHaveBeenCalledTimes(1);
  });

  it('handles auto-height configuration', () => {
    const autoHeightConfig = {
      ...defaultConfig,
      autoHeight: true
    };
    
    render(<CustomCarousel images={mockImages} config={autoHeightConfig} />);
    
    mockImageLoad();
    
    // Should adjust height based on image loading
    const container = document.querySelector('[style*="height"]');
    expect(container).toBeInTheDocument();
  });

  it('applies custom CSS classes', () => {
    const customClassName = 'custom-carousel-class';
    
    const { container } = render(
      <CustomCarousel 
        images={mockImages} 
        config={defaultConfig} 
        className={customClassName}
      />
    );
    
    expect(container.firstChild).toHaveClass(customClassName);
  });

  it('handles different aspect ratios', () => {
    const squareConfig = {
      ...defaultConfig,
      activeSlide: {
        aspectRatio: '1/1',
        width: '6/12'
      },
      nextSlide: {
        aspectRatio: '1/1',
        width: '3/12'
      },
      container: {
        aspectRatio: '2/1'
      }
    };
    
    render(<CustomCarousel images={mockImages} config={squareConfig} />);
    
    // Should render with custom aspect ratios
    expect(document.querySelector('[style*="background-image"]')).toBeInTheDocument();
  });

  it('handles container alignment options', () => {
    const alignmentConfigs = [
      { alignItems: 'start', justifyContent: 'start' },
      { alignItems: 'center', justifyContent: 'center' },
      { alignItems: 'end', justifyContent: 'end' }
    ] as const;
    
    alignmentConfigs.forEach(alignment => {
      const config = {
        ...defaultConfig,
        container: {
          ...defaultConfig.container,
          ...alignment
        }
      };
      
      const { container } = render(<CustomCarousel images={mockImages} config={config} />);
      
      expect(container.firstChild).toHaveClass(`items-${alignment.alignItems}`);
      expect(container.firstChild).toHaveClass(`justify-${alignment.justifyContent}`);
    });
  });

  it('handles different gap sizes', () => {
    const gapSizes = ['gap-0', 'gap-2', 'gap-4', 'gap-8'] as const;
    
    gapSizes.forEach(gap => {
      const config = {
        ...defaultConfig,
        container: {
          ...defaultConfig.container,
          gap
        }
      };
      
      const { container } = render(<CustomCarousel images={mockImages} config={config} />);
      
      expect(container.firstChild).toHaveClass(gap);
    });
  });

  it('handles navigation style options', () => {
    const navConfig = {
      ...defaultConfig,
      navigationStyle: {
        size: 'lg' as const,
        color: 'dark' as const,
        position: 'outside' as const
      }
    };
    
    render(<CustomCarousel images={mockImages} config={navConfig} />);
    
    const buttons = screen.getAllByRole('button').filter(
      button => button.querySelector('svg')
    );
    
    buttons.forEach(button => {
      expect(button).toHaveClass('w-12', 'h-12'); // lg size
      expect(button).toHaveClass('bg-black/80', 'text-white'); // dark color
    });
  });

  it('handles pagination style options', () => {
    const paginationConfig = {
      ...defaultConfig,
      paginationStyle: {
        position: 'bottom-center' as const,
        style: 'bars' as const
      }
    };
    
    render(<CustomCarousel images={mockImages} config={paginationConfig} />);
    
    const paginationContainer = document.querySelector('.absolute.bottom-4.left-1\\/2');
    expect(paginationContainer).toBeInTheDocument();
    
    const paginationButtons = screen.getAllByRole('button').filter(
      button => !button.querySelector('svg')
    );
    
    paginationButtons.forEach(button => {
      expect(button).toHaveClass('w-6', 'h-1'); // bar style
    });
  });

  it('handles next slide preview visibility', () => {
    // Config with visible next slide
    const visibleNextConfig = {
      ...defaultConfig,
      nextSlide: {
        ...defaultConfig.nextSlide,
        width: '4/12'
      }
    };
    
    const { container: visibleContainer } = render(
      <CustomCarousel images={mockImages} config={visibleNextConfig} />
    );
    
    expect(visibleContainer.firstChild?.children.length).toBeGreaterThan(1);
    
    // Config with hidden next slide
    const hiddenNextConfig = {
      ...defaultConfig,
      nextSlide: {
        ...defaultConfig.nextSlide,
        width: '0%'
      }
    };
    
    const { container: hiddenContainer } = render(
      <CustomCarousel images={mockImages} config={hiddenNextConfig} />
    );
    
    // Should have fewer child elements when next slide is hidden
    expect(hiddenContainer.firstChild?.children.length).toBe(1);
  });

  describe('Auto-play functionality', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('enables auto-play when configured', () => {
      const autoPlayConfig = {
        ...defaultConfig,
        autoPlay: true,
        autoPlayInterval: 1000
      };
      
      const onSlideChange = jest.fn();
      
      render(
        <CustomCarousel 
          images={mockImages} 
          config={autoPlayConfig} 
          onSlideChange={onSlideChange}
        />
      );
      
      // Fast-forward time
      jest.advanceTimersByTime(1000);
      
      expect(onSlideChange).toHaveBeenCalledWith(1);
    });

    it('does not auto-play when disabled', () => {
      const onSlideChange = jest.fn();
      
      render(
        <CustomCarousel 
          images={mockImages} 
          config={defaultConfig} 
          onSlideChange={onSlideChange}
        />
      );
      
      // Fast-forward time
      jest.advanceTimersByTime(5001);
      
      expect(onSlideChange).not.toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('handles missing image properties gracefully', () => {
      const incompleteImages = [
        { file_path: '/images/test1.jpg' },
        { file_path: '/images/test2.jpg', alt: '' }
      ] as CarouselImage[];
      
      expect(() => {
        render(<CustomCarousel images={incompleteImages} config={defaultConfig} />);
      }).not.toThrow();
    });

    it('handles invalid configuration gracefully', () => {
      const invalidConfig = {
        ...defaultConfig,
        transitionDuration: -100,
        container: {
          aspectRatio: 'invalid'
        }
      } as any;
      
      expect(() => {
        render(<CustomCarousel images={mockImages} config={invalidConfig} />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA labels', () => {
      render(<CustomCarousel images={mockImages} config={defaultConfig} />);
      
      const prevButton = screen.getByRole('button', { name: /previous/i });
      const nextButton = screen.getByRole('button', { name: /next/i });
      
      expect(prevButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
    });

    it('handles keyboard navigation', () => {
      render(<CustomCarousel images={mockImages} config={defaultConfig} />);
      
      const nextButton = screen.getByRole('button', { name: /next/i });
      
      // Should be focusable
      nextButton.focus();
      expect(nextButton).toHaveFocus();
      
      // Should respond to Enter/Space
      fireEvent.keyDown(nextButton, { key: 'Enter', code: 'Enter' });
      fireEvent.keyUp(nextButton, { key: 'Enter', code: 'Enter' });
    });

    it('provides alt text for images', () => {
      render(<CustomCarousel images={mockImages} config={defaultConfig} />);
      
      // Hidden images should have proper alt attributes
      const hiddenImages = document.querySelectorAll('img.hidden');
      hiddenImages.forEach((img, index) => {
        expect(img).toHaveAttribute('alt', mockImages[index].alt || expect.any(String));
      });
    });
  });
});