import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Projects from '../Projects/index';

// Mock AOS
jest.mock('aos', () => ({
  init: jest.fn(),
  refresh: jest.fn(),
}));

// Mock API calls
jest.mock('@/api/projects', () => ({
  getProjects: jest.fn(),
}));

// Mock components
jest.mock('@/components/Layout/PageBanner', () => {
  return function PageBanner({ children, config }: any) {
    return (
      <div data-testid="page-banner">
        <div>{config.logoSection.title}</div>
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

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  
  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          {component}
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

// Mock project data
const mockProjects = [
  {
    id: '1',
    title: '測試專案一',
    subtitle: '測試副標題',
    year: '2023',
    base_address: '台北市信義區',
    area: '1000坪',
    floor_plan_info: '15F / B3',
    facebook_page: 'https://facebook.com/test1',
    info_website: 'https://test1.com',
    description: '這是測試專案的描述',
    custom_fields: JSON.stringify([
      { label: '建案類型', value: '住宅大樓' },
      { label: '總戶數', value: '100戶' }
    ])
  },
  {
    id: '2',
    title: '測試專案二',
    subtitle: '測試副標題二',
    year: '2024',
    base_address: '新北市板橋區',
    area: '800坪',
    floor_plan_info: '12F / B2',
    facebook_page: '',
    info_website: '',
    description: '這是第二個測試專案',
    custom_fields: null
  }
];

describe('Projects Page', () => {
  const { getProjects } = require('@/api/projects');

  beforeEach(() => {
    jest.clearAllMocks();
    getProjects.mockResolvedValue(mockProjects);
  });

  it('renders page banner with correct title', () => {
    renderWithProviders(<Projects />);
    
    expect(screen.getByText('建案實績')).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    getProjects.mockImplementation(() => new Promise(() => {})); // Never resolves
    renderWithProviders(<Projects />);
    
    expect(screen.getByText('載入中...')).toBeInTheDocument();
  });

  it('displays projects when data is loaded', async () => {
    renderWithProviders(<Projects />);
    
    await waitFor(() => {
      expect(screen.getByText('測試專案一')).toBeInTheDocument();
      expect(screen.getByText('測試專案二')).toBeInTheDocument();
    });
  });

  it('displays project details correctly', async () => {
    renderWithProviders(<Projects />);
    
    await waitFor(() => {
      // Check first project details
      expect(screen.getByText('台北市信義區')).toBeInTheDocument();
      expect(screen.getByText('1000坪')).toBeInTheDocument();
      expect(screen.getByText('15F / B3')).toBeInTheDocument();
      expect(screen.getByText('2023')).toBeInTheDocument();
    });
  });

  it('displays custom fields when available', async () => {
    renderWithProviders(<Projects />);
    
    await waitFor(() => {
      expect(screen.getByText('建案類型')).toBeInTheDocument();
      expect(screen.getByText('住宅大樓')).toBeInTheDocument();
      expect(screen.getByText('總戶數')).toBeInTheDocument();
      expect(screen.getByText('100戶')).toBeInTheDocument();
    });
  });

  it('displays facebook and website links when available', async () => {
    renderWithProviders(<Projects />);
    
    await waitFor(() => {
      const facebookLink = screen.getByRole('link', { name: /https:\/\/facebook\.com\/test1/ });
      const websiteLink = screen.getByRole('link', { name: /https:\/\/test1\.com/ });
      
      expect(facebookLink).toHaveAttribute('href', 'https://facebook.com/test1');
      expect(websiteLink).toHaveAttribute('href', 'https://test1.com');
      expect(facebookLink).toHaveAttribute('target', '_blank');
      expect(websiteLink).toHaveAttribute('target', '_blank');
    });
  });

  it('handles projects without facebook/website gracefully', async () => {
    renderWithProviders(<Projects />);
    
    await waitFor(() => {
      expect(screen.getByText('測試專案二')).toBeInTheDocument();
    });
    
    // Should not show facebook/website sections for project 2
    const allLinks = screen.getAllByRole('link');
    const project2Links = allLinks.filter(link => 
      link.getAttribute('href')?.includes('facebook.com/test2') ||
      link.getAttribute('href')?.includes('test2.com')
    );
    expect(project2Links).toHaveLength(0);
  });

  it('displays error message when API fails', async () => {
    getProjects.mockRejectedValue(new Error('API Error'));
    renderWithProviders(<Projects />);
    
    await waitFor(() => {
      expect(screen.getByText('載入專案資料時發生錯誤')).toBeInTheDocument();
    });
  });

  it('displays "no projects" message when no data', async () => {
    getProjects.mockResolvedValue([]);
    renderWithProviders(<Projects />);
    
    await waitFor(() => {
      expect(screen.getByText('目前沒有專案資料')).toBeInTheDocument();
    });
  });
});