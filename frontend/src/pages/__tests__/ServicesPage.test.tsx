/**
 * ============================================================================
 * SERVICES PAGE TESTS
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ServicesPage } from '../ServicesPage';
import { MemoryRouter } from 'react-router-dom';
import { cmsApi } from '@/services/cmsApi';

// Mock cmsApi
vi.mock('@/services/cmsApi', () => ({
  cmsApi: {
    getServiceCategories: vi.fn(),
  },
}));

const mockCmsApi = vi.mocked(cmsApi);

// Mock SEO component
vi.mock('@/components/SEO', () => ({
  SEO: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="seo" data-title={title} data-description={description} />
  ),
}));

const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  );
};

describe('ServicesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', async () => {
    mockCmsApi.getServiceCategories.mockResolvedValue({
      success: true,
      data: [],
    });

    renderWithRouter(<ServicesPage />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText(/Services That/i)).toBeInTheDocument();
    });
  });

  it('renders SEO with correct title and description', async () => {
    mockCmsApi.getServiceCategories.mockResolvedValue({
      success: true,
      data: [],
    });

    renderWithRouter(<ServicesPage />);
    
    await waitFor(() => {
      const seo = screen.getByTestId('seo');
      expect(seo).toHaveAttribute('data-title', 'Our Services');
      expect(seo).toHaveAttribute(
        'data-description',
        'AI systems, custom software, mobile apps, and marketing services that drive revenue. Built by engineers in Bhagalpur, Bihar.'
      );
    });
  });

  it('displays page header with badge', async () => {
    mockCmsApi.getServiceCategories.mockResolvedValue({
      success: true,
      data: [],
    });

    renderWithRouter(<ServicesPage />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('What We Build')).toBeInTheDocument();
    });
    expect(screen.getByText(/Drive Revenue/i)).toBeInTheDocument();
  });

  it('shows loading skeletons while fetching data', () => {
    mockCmsApi.getServiceCategories.mockReturnValue(new Promise(() => {}));

    const { container } = renderWithRouter(<ServicesPage />);
    
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays service categories after loading', async () => {
    const mockCategories = [
      {
        id: '1',
        slug: 'ai-services',
        title: 'AI Services',
        description: 'AI solutions for your business',
        services: [],
      },
      {
        id: '2',
        slug: 'web-development',
        title: 'Web Development',
        description: 'Custom web solutions',
        services: [],
      },
    ];

    mockCmsApi.getServiceCategories.mockResolvedValue({
      success: true,
      data: mockCategories,
    });

    renderWithRouter(<ServicesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('AI Services')).toBeInTheDocument();
      expect(screen.getByText('Web Development')).toBeInTheDocument();
    });
  });

  it('displays services within categories', async () => {
    const mockCategories = [
      {
        id: '1',
        slug: 'category-1',
        title: 'Category 1',
        description: 'Description 1',
        services: [
          {
            id: 's1',
            slug: 'service-1',
            title: 'Service 1',
            shortDescription: 'Short desc 1',
            order: 1,
          },
        ],
      },
    ];

    mockCmsApi.getServiceCategories.mockResolvedValue({
      success: true,
      data: mockCategories,
    });

    renderWithRouter(<ServicesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Service 1')).toBeInTheDocument();
      expect(screen.getByText('Short desc 1')).toBeInTheDocument();
    });
  });

  it('renders service links with correct href', async () => {
    const mockCategories = [
      {
        id: '1',
        slug: 'category-1',
        title: 'Category 1',
        description: 'Description 1',
        services: [
          {
            id: 's1',
            slug: 'my-service',
            title: 'My Service',
            shortDescription: 'Description',
            order: 1,
          },
        ],
      },
    ];

    mockCmsApi.getServiceCategories.mockResolvedValue({
      success: true,
      data: mockCategories,
    });

    renderWithRouter(<ServicesPage />);
    
    await waitFor(() => {
      const link = screen.getByRole('link', { name: /My Service/i });
      expect(link).toHaveAttribute('href', '/services/my-service');
    });
  });

  it('displays "See Details" text on service cards', async () => {
    const mockCategories = [
      {
        id: '1',
        slug: 'category-1',
        title: 'Category 1',
        description: 'Description 1',
        services: [
          {
            id: 's1',
            slug: 'service-1',
            title: 'Service 1',
            shortDescription: 'Description',
            order: 1,
          },
        ],
      },
    ];

    mockCmsApi.getServiceCategories.mockResolvedValue({
      success: true,
      data: mockCategories,
    });

    renderWithRouter(<ServicesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('See Details')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    mockCmsApi.getServiceCategories.mockRejectedValue(new Error('API Error'));

    renderWithRouter(<ServicesPage />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load categories:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('handles unsuccessful API response', async () => {
    mockCmsApi.getServiceCategories.mockResolvedValue({
      success: false,
      error: { code: 'ERROR', message: 'Failed' },
    });

    renderWithRouter(<ServicesPage />);
    
    // Should still render without crashing
    await waitFor(() => {
      expect(screen.getByText(/Services That/i)).toBeInTheDocument();
    });
  });

  it('has aria-label for accessibility', async () => {
    mockCmsApi.getServiceCategories.mockResolvedValue({
      success: true,
      data: [],
    });

    const { container } = renderWithRouter(<ServicesPage />);
    
    await waitFor(() => {
      const section = container.querySelector('[aria-label="Services listing"]');
      expect(section).toBeInTheDocument();
    });
  });

  it('has responsive grid layout for services', async () => {
    const mockCategories = [
      {
        id: '1',
        slug: 'category-1',
        title: 'Category 1',
        description: 'Description 1',
        services: [],
      },
    ];

    mockCmsApi.getServiceCategories.mockResolvedValue({
      success: true,
      data: mockCategories,
    });

    const { container } = renderWithRouter(<ServicesPage />);
    
    await waitFor(() => {
      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
    });
  });

  it('renders category title as heading', async () => {
    const mockCategories = [
      {
        id: '1',
        slug: 'category-1',
        title: 'AI Services',
        description: 'Description',
        services: [],
      },
    ];

    mockCmsApi.getServiceCategories.mockResolvedValue({
      success: true,
      data: mockCategories,
    });

    renderWithRouter(<ServicesPage />);
    
    await waitFor(() => {
      const heading = screen.getByRole('heading', { name: 'AI Services' });
      expect(heading).toBeInTheDocument();
    });
  });

  it('has hover effects on service cards', async () => {
    const mockCategories = [
      {
        id: '1',
        slug: 'category-1',
        title: 'Category 1',
        description: 'Description',
        services: [
          {
            id: 's1',
            slug: 'service-1',
            title: 'Service 1',
            shortDescription: 'Description',
            order: 1,
          },
        ],
      },
    ];

    mockCmsApi.getServiceCategories.mockResolvedValue({
      success: true,
      data: mockCategories,
    });

    const { container } = renderWithRouter(<ServicesPage />);
    
    await waitFor(() => {
      const card = container.querySelector('.ai-card');
      expect(card).toBeInTheDocument();
    });
  });

  it('handles empty services array', async () => {
    const mockCategories = [
      {
        id: '1',
        slug: 'category-1',
        title: 'Category 1',
        description: 'Description',
        services: [],
      },
    ];

    mockCmsApi.getServiceCategories.mockResolvedValue({
      success: true,
      data: mockCategories,
    });

    renderWithRouter(<ServicesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Category 1')).toBeInTheDocument();
    });
  });

  it('handles undefined services property', async () => {
    const mockCategories = [
      {
        id: '1',
        slug: 'category-1',
        title: 'Category 1',
        description: 'Description',
      },
    ];

    mockCmsApi.getServiceCategories.mockResolvedValue({
      success: true,
      data: mockCategories,
    });

    renderWithRouter(<ServicesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Category 1')).toBeInTheDocument();
    });
  });

  it('has container with responsive padding', async () => {
    mockCmsApi.getServiceCategories.mockResolvedValue({
      success: true,
      data: [],
    });

    const { container } = renderWithRouter(<ServicesPage />);
    
    await waitFor(() => {
      const containerDiv = container.querySelector('.container');
      expect(containerDiv).toBeInTheDocument();
    });
  });

  it('has pt-24 class for top padding', async () => {
    mockCmsApi.getServiceCategories.mockResolvedValue({
      success: true,
      data: [],
    });

    const { container } = renderWithRouter(<ServicesPage />);
    
    await waitFor(() => {
      const wrapper = container.querySelector('.pt-24');
      expect(wrapper).toBeInTheDocument();
    });
  });
});
