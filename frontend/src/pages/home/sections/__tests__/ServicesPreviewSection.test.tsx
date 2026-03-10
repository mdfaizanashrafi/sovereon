/**
 * ============================================================================
 * SERVICES PREVIEW SECTION TESTS
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ServicesPreviewSection } from '../ServicesPreviewSection';
import { MemoryRouter } from 'react-router-dom';
import { cmsApi } from '@/services/cmsApi';

// Mock the cmsApi
vi.mock('@/services/cmsApi', () => ({
  cmsApi: {
    getServiceCategories: vi.fn(),
  },
}));

const mockCmsApi = vi.mocked(cmsApi);

// Wrap component with Router since it uses Link
const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  );
};

describe('ServicesPreviewSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders section header', () => {
    mockCmsApi.getServiceCategories.mockResolvedValue({
      success: true,
      data: [],
    });

    renderWithRouter(<ServicesPreviewSection />);
    
    expect(screen.getByText('Our Services')).toBeInTheDocument();
    expect(screen.getByText(/Services That/i)).toBeInTheDocument();
    expect(screen.getByText(/Move the Needle/i)).toBeInTheDocument();
  });

  it('displays section description', () => {
    mockCmsApi.getServiceCategories.mockResolvedValue({
      success: true,
      data: [],
    });

    renderWithRouter(<ServicesPreviewSection />);
    
    expect(screen.getByText(/From custom software to marketing campaigns/i)).toBeInTheDocument();
  });

  it('renders loading skeletons initially', () => {
    mockCmsApi.getServiceCategories.mockReturnValue(new Promise(() => {}));

    const { container } = renderWithRouter(<ServicesPreviewSection />);
    
    // Check for skeleton elements
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
      },
      {
        id: '2',
        slug: 'web-development',
        title: 'Web Development',
        description: 'Custom web solutions',
      },
    ];

    mockCmsApi.getServiceCategories.mockResolvedValue({
      success: true,
      data: mockCategories,
    });

    renderWithRouter(<ServicesPreviewSection />);
    
    await waitFor(() => {
      expect(screen.getByText('AI Services')).toBeInTheDocument();
      expect(screen.getByText('Web Development')).toBeInTheDocument();
    });
  });

  it('limits displayed categories to 6 items', async () => {
    const mockCategories = Array.from({ length: 10 }, (_, i) => ({
      id: String(i + 1),
      slug: `service-${i + 1}`,
      title: `Service ${i + 1}`,
      description: `Description ${i + 1}`,
    }));

    mockCmsApi.getServiceCategories.mockResolvedValue({
      success: true,
      data: mockCategories,
    });

    const { container } = renderWithRouter(<ServicesPreviewSection />);
    
    await waitFor(() => {
      const cards = container.querySelectorAll('[data-slot="card"]');
      expect(cards.length).toBeLessThanOrEqual(6);
    });
  });

  it('renders service cards with links', async () => {
    const mockCategories = [
      {
        id: '1',
        slug: 'test-service',
        title: 'Test Service',
        description: 'Test description',
      },
    ];

    mockCmsApi.getServiceCategories.mockResolvedValue({
      success: true,
      data: mockCategories,
    });

    renderWithRouter(<ServicesPreviewSection />);
    
    await waitFor(() => {
      // Look for the service card link
      const link = screen.getByRole('link', { name: /Test Service/i });
      expect(link).toHaveAttribute('href', '/services/test-service');
    });
  });

  it('displays "See What We Build" text on cards', async () => {
    const mockCategories = [
      {
        id: '1',
        slug: 'test-service',
        title: 'Test Service',
        description: 'Test description',
      },
    ];

    mockCmsApi.getServiceCategories.mockResolvedValue({
      success: true,
      data: mockCategories,
    });

    renderWithRouter(<ServicesPreviewSection />);
    
    await waitFor(() => {
      expect(screen.getByText('See What We Build')).toBeInTheDocument();
    });
  });

  it('renders "View All Services" button', async () => {
    mockCmsApi.getServiceCategories.mockResolvedValue({
      success: true,
      data: [],
    });

    renderWithRouter(<ServicesPreviewSection />);
    
    await waitFor(() => {
      const viewAllButton = screen.getByRole('link', { name: /View All Services/i });
      expect(viewAllButton).toHaveAttribute('href', '/services');
    });
  });

  it('handles API error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    mockCmsApi.getServiceCategories.mockRejectedValue(new Error('API Error'));

    renderWithRouter(<ServicesPreviewSection />);
    
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

    renderWithRouter(<ServicesPreviewSection />);
    
    // Should still render without crashing
    await waitFor(() => {
      expect(screen.getByText('Our Services')).toBeInTheDocument();
    });
  });

  it('has responsive grid layout', async () => {
    mockCmsApi.getServiceCategories.mockResolvedValue({
      success: true,
      data: [],
    });

    const { container } = renderWithRouter(<ServicesPreviewSection />);
    
    await waitFor(() => {
      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
    });
  });

  it('applies animation delays to cards', async () => {
    const mockCategories = [
      { id: '1', slug: 's1', title: 'Service 1', description: 'Desc 1' },
      { id: '2', slug: 's2', title: 'Service 2', description: 'Desc 2' },
    ];

    mockCmsApi.getServiceCategories.mockResolvedValue({
      success: true,
      data: mockCategories,
    });

    const { container } = renderWithRouter(<ServicesPreviewSection />);
    
    await waitFor(() => {
      const animatedCards = container.querySelectorAll('.animate-fade-in-up');
      expect(animatedCards.length).toBeGreaterThan(0);
    });
  });

  it('displays card with hover effect classes', async () => {
    const mockCategories = [
      { id: '1', slug: 's1', title: 'Service 1', description: 'Desc 1' },
    ];

    mockCmsApi.getServiceCategories.mockResolvedValue({
      success: true,
      data: mockCategories,
    });

    const { container } = renderWithRouter(<ServicesPreviewSection />);
    
    await waitFor(() => {
      const card = container.querySelector('.ai-card');
      expect(card).toBeInTheDocument();
    });
  });
});
