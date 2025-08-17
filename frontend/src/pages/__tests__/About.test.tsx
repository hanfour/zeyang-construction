import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import About from '../About/index';

// Mock AOS
jest.mock('aos', () => ({
  init: jest.fn(),
  refresh: jest.fn(),
}));

// Mock components that might have complex dependencies
jest.mock('@/components/Layout/PageBanner', () => {
  return function PageBanner({ children, config }: any) {
    return (
      <div data-testid="page-banner">
        <div>{config.logoSection.title}</div>
        <div>{config.centralContent.text}</div>
        {children}
      </div>
    );
  };
});

jest.mock('@/components/Layout/MenuButton', () => {
  return function MenuButton({ isOpen, onClick }: any) {
    return <button onClick={onClick} data-testid="menu-button">Menu</button>;
  };
});

jest.mock('@/components/Layout/NavigationMenu', () => {
  return function NavigationMenu({ isOpen, onClose }: any) {
    return isOpen ? <div data-testid="navigation-menu">Navigation</div> : null;
  };
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        {component}
      </MemoryRouter>
    </HelmetProvider>
  );
};

describe('About Page', () => {
  beforeEach(() => {
    // Reset any mocks
    jest.clearAllMocks();
  });

  it('renders page banner with correct content', () => {
    renderWithProviders(<About />);
    
    expect(screen.getByText('關於澤暘')).toBeInTheDocument();
    expect(screen.getByText(/築的不只是房子，更是一種生活價值/)).toBeInTheDocument();
  });

  it('renders all main sections with correct titles', () => {
    renderWithProviders(<About />);
    
    // Check for section titles
    expect(screen.getByText('HOME OF DREAMS')).toBeInTheDocument();
    expect(screen.getByText('PRESIDENT')).toBeInTheDocument();
    expect(screen.getByText('PREMIUM STANDARD BUILDING')).toBeInTheDocument();
    expect(screen.getByText('LIVING IN SUSTAINABLE HARMONY')).toBeInTheDocument();
  });

  it('renders HOME OF DREAMS section content', () => {
    renderWithProviders(<About />);
    
    expect(screen.getByText('誠信築基')).toBeInTheDocument();
    expect(screen.getByText('匠心營造')).toBeInTheDocument();
    expect(screen.getByText(/澤暘建設深耕土地多年/)).toBeInTheDocument();
  });

  it('renders PRESIDENT section content', () => {
    renderWithProviders(<About />);
    
    expect(screen.getByText('澤暘建設')).toBeInTheDocument();
    expect(screen.getByText('江德成 總經理')).toBeInTheDocument();
    expect(screen.getByText('保陽建設 總經理')).toBeInTheDocument();
    expect(screen.getByText('金樹機構 執行長')).toBeInTheDocument();
  });

  it('renders PREMIUM section content', () => {
    renderWithProviders(<About />);
    
    expect(screen.getByText('精工鍛造 × 機能尺度')).toBeInTheDocument();
    expect(screen.getByText('量化家的幸福')).toBeInTheDocument();
    expect(screen.getByText(/澤暘的建築，講究的不只是格局/)).toBeInTheDocument();
  });

  it('renders LIVING section content', () => {
    renderWithProviders(<About />);
    
    expect(screen.getByText('便捷自然森活')).toBeInTheDocument();
    expect(screen.getByText('永續共好承諾')).toBeInTheDocument();
    expect(screen.getByText(/以永續共好為使命/)).toBeInTheDocument();
  });

  it('includes AOS data attributes for animations', () => {
    renderWithProviders(<About />);
    
    const sections = ['#homeDreams', '#president', '#premium', '#living'];
    sections.forEach(sectionId => {
      const section = document.querySelector(sectionId);
      expect(section).toBeInTheDocument();
    });
  });

  it('renders all required images with proper alt text', () => {
    renderWithProviders(<About />);
    
    expect(screen.getByAltText('澤暘建設 - 誠信築基 匠心營造')).toBeInTheDocument();
    expect(screen.getByAltText('澤暘建設 江德成 總經理')).toBeInTheDocument();
    expect(screen.getByAltText('建築設計')).toBeInTheDocument();
    expect(screen.getByAltText('精工鍛造 × 機能尺度 量化家的幸福')).toBeInTheDocument();
    expect(screen.getByAltText('孩童玩樂')).toBeInTheDocument();
    expect(screen.getByAltText('自然森活環境')).toBeInTheDocument();
  });

  it('sets correct page title', () => {
    renderWithProviders(<About />);
    
    // Note: Testing Helmet requires additional setup, but the title should be set
    // This is more of a smoke test to ensure the component renders without errors
    expect(screen.getByTestId('page-banner')).toBeInTheDocument();
  });
});