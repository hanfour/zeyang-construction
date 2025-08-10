import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProjectCard from '../ProjectCard';
import { Project } from '../../../types';

const mockProject: Project = {
  id: 1,
  identifier: 'test-project',
  slug: 'test-project',
  name: 'Test Project',
  nameEn: 'Test Project EN',
  type: 'residential',
  status: 'on_sale',
  location: 'Test Location',
  locationEn: 'Test Location EN',
  price: 1000000,
  priceMin: 800000,
  priceMax: 1200000,
  area: 100,
  areaMin: 80,
  areaMax: 120,
  developer: 'Test Developer',
  developerEn: 'Test Developer EN',
  description: 'Test description',
  descriptionEn: 'Test description EN',
  yearStarted: 2024,
  isFeatured: false,
  viewCount: 100,
  mainImage: '/test-image.jpg',
  images: [],
  tags: [
    { id: 1, name: 'luxury', nameEn: 'Luxury', category: 'style' }
  ],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01'
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ProjectCard', () => {
  it('renders project information correctly', () => {
    renderWithRouter(<ProjectCard project={mockProject} />);
    
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
    expect(screen.getByText('Test Developer')).toBeInTheDocument();
  });

  it('displays price range when available', () => {
    renderWithRouter(<ProjectCard project={mockProject} />);
    
    expect(screen.getByText(/800,000/)).toBeInTheDocument();
    expect(screen.getByText(/1,200,000/)).toBeInTheDocument();
  });

  it('displays single price when no range', () => {
    const projectWithSinglePrice = { ...mockProject, priceMin: null, priceMax: null };
    renderWithRouter(<ProjectCard project={projectWithSinglePrice} />);
    
    expect(screen.getByText(/1,000,000/)).toBeInTheDocument();
  });

  it('displays area information', () => {
    renderWithRouter(<ProjectCard project={mockProject} />);
    
    expect(screen.getByText(/80-120 坪/)).toBeInTheDocument();
  });

  it('displays project image', () => {
    renderWithRouter(<ProjectCard project={mockProject} />);
    
    const image = screen.getByAltText('Test Project');
    expect(image).toHaveAttribute('src', expect.stringContaining('/test-image.jpg'));
  });

  it('displays placeholder image when no image provided', () => {
    const projectWithoutImage = { ...mockProject, mainImage: null };
    renderWithRouter(<ProjectCard project={projectWithoutImage} />);
    
    const image = screen.getByAltText('Test Project');
    expect(image).toHaveAttribute('src', expect.stringContaining('placeholder'));
  });

  it('displays project tags', () => {
    renderWithRouter(<ProjectCard project={mockProject} />);
    
    expect(screen.getByText('Luxury')).toBeInTheDocument();
  });

  it('displays project status badge', () => {
    renderWithRouter(<ProjectCard project={mockProject} />);
    
    expect(screen.getByText('熱銷中')).toBeInTheDocument();
  });

  it('links to project detail page', () => {
    const projectWithSlug = { ...mockProject, slug: 'test-project' };
    renderWithRouter(<ProjectCard project={projectWithSlug} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/projects/test-project');
  });

  it('applies hover effects', () => {
    renderWithRouter(<ProjectCard project={mockProject} />);
    
    const card = screen.getByRole('link');
    fireEvent.mouseEnter(card);
    
    const image = screen.getByAltText('Test Project');
    expect(image).toHaveClass('group-hover:scale-110');
  });
});