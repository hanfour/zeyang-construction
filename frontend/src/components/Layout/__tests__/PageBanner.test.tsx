import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PageBanner, { PageBannerConfig } from '../PageBanner';

const mockConfig: PageBannerConfig = {
  logoSection: {
    iconSrc: '/images/logo-icon.svg',
    iconAlt: 'Company Logo',
    subtitle: 'ABOUT US',
    title: '關於我們'
  },
  centralContent: {
    text: '歡迎來到我們的網站\n了解更多關於我們的資訊'
  },
  backgroundImage: '/images/banner-bg.jpg',
  height: 'h-80'
};

describe('PageBanner', () => {
  it('renders banner with all content', () => {
    render(<PageBanner config={mockConfig} />);
    
    // Check background image
    const banner = screen.getByRole('banner', { hidden: true }) || 
                  document.querySelector('section');
    
    expect(banner).toHaveStyle({
      backgroundImage: `url('${mockConfig.backgroundImage}')`
    });
    
    // Check logo section
    const logoImg = screen.getByAltText(mockConfig.logoSection.iconAlt);
    expect(logoImg).toBeInTheDocument();
    expect(logoImg).toHaveAttribute('src', mockConfig.logoSection.iconSrc);
    
    // Check subtitle and title
    expect(screen.getByText(mockConfig.logoSection.subtitle)).toBeInTheDocument();
    expect(screen.getByText(mockConfig.logoSection.title)).toBeInTheDocument();
    
    // Check central content
    expect(screen.getByText(/歡迎來到我們的網站/)).toBeInTheDocument();
    expect(screen.getByText(/了解更多關於我們的資訊/)).toBeInTheDocument();
  });

  it('applies custom height class', () => {
    render(<PageBanner config={mockConfig} />);
    
    const banner = document.querySelector('section');
    expect(banner).toHaveClass('h-80');
  });

  it('uses default height when not specified', () => {
    const configWithoutHeight = {
      ...mockConfig,
      height: undefined
    };
    
    render(<PageBanner config={configWithoutHeight} />);
    
    const banner = document.querySelector('section');
    expect(banner).toHaveClass('h-72'); // default height
  });

  it('renders line breaks in central content', () => {
    render(<PageBanner config={mockConfig} />);
    
    // Check that text with \n creates line breaks
    const textContainer = screen.getByText(/歡迎來到我們的網站/).closest('p');
    expect(textContainer).toBeInTheDocument();
    
    // Should contain <br> tags for line breaks
    expect(textContainer?.innerHTML).toContain('<br>');
  });

  it('handles multiline central content correctly', () => {
    const multilineConfig = {
      ...mockConfig,
      centralContent: {
        text: 'Line 1\nLine 2\nLine 3\nLine 4'
      }
    };
    
    render(<PageBanner config={multilineConfig} />);
    
    const textContainer = screen.getByText(/Line 1/).closest('p');
    
    // Should have multiple line breaks
    const brCount = (textContainer?.innerHTML.match(/<br>/g) || []).length;
    expect(brCount).toBe(3); // n lines = n-1 breaks
  });

  it('renders children components', () => {
    const TestChild = () => <div data-testid="test-child">Test Child</div>;
    
    render(
      <PageBanner config={mockConfig}>
        <TestChild />
      </PageBanner>
    );
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('applies correct CSS classes for layout', () => {
    render(<PageBanner config={mockConfig} />);
    
    const banner = document.querySelector('section');
    expect(banner).toHaveClass(
      'relative',
      'bg-cover',
      'bg-center',
      'bg-no-repeat'
    );
  });

  it('positions logo section correctly', () => {
    render(<PageBanner config={mockConfig} />);
    
    const logoSection = screen.getByAltText(mockConfig.logoSection.iconAlt)
      .closest('div')?.closest('div');
    
    expect(logoSection).toHaveClass('relative', 'z-20');
  });

  it('positions central content correctly', () => {
    render(<PageBanner config={mockConfig} />);
    
    const centralContent = screen.getByText(/歡迎來到我們的網站/)
      .closest('div');
    
    expect(centralContent).toHaveClass(
      'absolute',
      'inset-0',
      'flex',
      'items-center',
      'justify-center',
      'z-10'
    );
  });

  it('applies text styling correctly', () => {
    render(<PageBanner config={mockConfig} />);
    
    // Check subtitle styling
    const subtitle = screen.getByText(mockConfig.logoSection.subtitle);
    expect(subtitle).toHaveClass(
      'text-white',
      'text-sm',
      'tracking-wider'
    );
    
    // Check title styling
    const title = screen.getByText(mockConfig.logoSection.title);
    expect(title).toHaveClass(
      'text-white',
      'text-sm',
      'tracking-wider'
    );
    
    // Check central content styling
    const centralText = screen.getByText(/歡迎來到我們的網站/)
      .closest('p');
    expect(centralText).toHaveClass(
      'text-content-mobile',
      'lg:text-content-desktop',
      'leading-relaxed',
      'font-normal',
      'tracking-wide'
    );
  });

  it('handles logo image styling', () => {
    render(<PageBanner config={mockConfig} />);
    
    const logoImg = screen.getByAltText(mockConfig.logoSection.iconAlt);
    expect(logoImg).toHaveClass(
      'h-10',
      'w-auto',
      'mr-4',
      'filter',
      'brightness-0',
      'invert'
    );
  });

  it('handles empty central content', () => {
    const configWithEmptyContent = {
      ...mockConfig,
      centralContent: {
        text: ''
      }
    };
    
    render(<PageBanner config={configWithEmptyContent} />);
    
    // Should still render the central content container
    const centralContainer = document.querySelector('.absolute.inset-0.flex.items-center.justify-center');
    expect(centralContainer).toBeInTheDocument();
  });

  it('handles special characters in text', () => {
    const configWithSpecialChars = {
      ...mockConfig,
      logoSection: {
        ...mockConfig.logoSection,
        subtitle: 'SPECIAL CHARS: @#$%^&*()',
        title: '特殊字符：！@#￥%……&*（）'
      },
      centralContent: {
        text: '包含特殊字符的文本：<>&"\'`\n以及一些 emoji 😀🎉🚀'
      }
    };
    
    render(<PageBanner config={configWithSpecialChars} />);
    
    expect(screen.getByText('SPECIAL CHARS: @#$%^&*()')).toBeInTheDocument();
    expect(screen.getByText('特殊字符：！@#￥%……&*（）')).toBeInTheDocument();
    expect(screen.getByText(/包含特殊字符的文本/)).toBeInTheDocument();
  });

  it('handles very long text content', () => {
    const longText = 'A'.repeat(1000);
    const configWithLongText = {
      ...mockConfig,
      centralContent: {
        text: longText
      }
    };
    
    render(<PageBanner config={configWithLongText} />);
    
    expect(screen.getByText(longText)).toBeInTheDocument();
  });

  it('handles missing alt text gracefully', () => {
    const configWithoutAlt = {
      ...mockConfig,
      logoSection: {
        ...mockConfig.logoSection,
        iconAlt: ''
      }
    };
    
    render(<PageBanner config={configWithoutAlt} />);
    
    const logoImg = screen.getByRole('img');
    expect(logoImg).toHaveAttribute('alt', '');
  });

  describe('Responsive Design', () => {
    it('applies responsive padding classes', () => {
      render(<PageBanner config={mockConfig} />);
      
      const headerSection = screen.getByAltText(mockConfig.logoSection.iconAlt)
        .closest('div')?.closest('div')?.closest('div');
      
      expect(headerSection).toHaveClass('p-4', 'lg:p-12');
    });

    it('applies responsive text classes', () => {
      render(<PageBanner config={mockConfig} />);
      
      const centralText = screen.getByText(/歡迎來到我們的網站/)
        .closest('p');
      
      expect(centralText).toHaveClass(
        'text-content-mobile',
        'lg:text-content-desktop'
      );
    });
  });

  describe('Accessibility', () => {
    it('provides proper image accessibility', () => {
      render(<PageBanner config={mockConfig} />);
      
      const logoImg = screen.getByRole('img');
      expect(logoImg).toHaveAttribute('alt', mockConfig.logoSection.iconAlt);
    });

    it('uses semantic HTML structure', () => {
      render(<PageBanner config={mockConfig} />);
      
      const banner = document.querySelector('section');
      expect(banner).toBeInTheDocument();
      
      const heading = screen.getByText(mockConfig.logoSection.title);
      expect(heading.tagName.toLowerCase()).toBe('h1');
    });

    it('maintains proper heading hierarchy', () => {
      render(<PageBanner config={mockConfig} />);
      
      const subtitle = screen.getByText(mockConfig.logoSection.subtitle);
      const title = screen.getByText(mockConfig.logoSection.title);
      
      expect(subtitle.tagName.toLowerCase()).toBe('p');
      expect(title.tagName.toLowerCase()).toBe('h1');
    });
  });

  describe('Performance', () => {
    it('handles background image loading', () => {
      render(<PageBanner config={mockConfig} />);
      
      const banner = document.querySelector('section');
      const backgroundImage = window.getComputedStyle(banner!)
        .getPropertyValue('background-image');
      
      expect(backgroundImage).toContain(mockConfig.backgroundImage);
    });

    it('does not cause memory leaks with multiple renders', () => {
      const { rerender } = render(<PageBanner config={mockConfig} />);
      
      // Re-render multiple times
      for (let i = 0; i < 5; i++) {
        const newConfig = {
          ...mockConfig,
          backgroundImage: `/images/bg-${i}.jpg`
        };
        rerender(<PageBanner config={newConfig} />);
      }
      
      // Should not throw errors
      expect(document.querySelector('section')).toBeInTheDocument();
    });
  });

  describe('Integration with other components', () => {
    it('renders with MenuButton child', () => {
      const MockMenuButton = () => (
        <button data-testid="menu-button">Menu</button>
      );
      
      render(
        <PageBanner config={mockConfig}>
          <MockMenuButton />
        </PageBanner>
      );
      
      expect(screen.getByTestId('menu-button')).toBeInTheDocument();
    });

    it('renders with NavigationMenu child', () => {
      const MockNavigationMenu = () => (
        <nav data-testid="navigation-menu">Navigation</nav>
      );
      
      render(
        <PageBanner config={mockConfig}>
          <MockNavigationMenu />
        </PageBanner>
      );
      
      expect(screen.getByTestId('navigation-menu')).toBeInTheDocument();
    });

    it('renders multiple children components', () => {
      const MockComponent1 = () => <div data-testid="component-1">Component 1</div>;
      const MockComponent2 = () => <div data-testid="component-2">Component 2</div>;
      
      render(
        <PageBanner config={mockConfig}>
          <MockComponent1 />
          <MockComponent2 />
        </PageBanner>
      );
      
      expect(screen.getByTestId('component-1')).toBeInTheDocument();
      expect(screen.getByTestId('component-2')).toBeInTheDocument();
    });
  });
});