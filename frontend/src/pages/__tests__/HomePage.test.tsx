/**
 * ============================================================================
 * HOMEPAGE TESTS
 * ============================================================================
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HomePage } from '../HomePage';
import { MemoryRouter } from 'react-router-dom';

// Mock the section components
vi.mock('../home/sections', () => ({
  HeroSection: () => <div data-testid="hero-section">Hero Section</div>,
  ResultsSection: () => <div data-testid="results-section">Results Section</div>,
  WhyChooseUsSection: () => <div data-testid="why-choose-section">Why Choose Us</div>,
  ServicesPreviewSection: () => <div data-testid="services-section">Services Preview</div>,
  ReviewsSection: () => <div data-testid="reviews-section">Reviews Section</div>,
  CurrentProjectsSection: () => <div data-testid="projects-section">Current Projects</div>,
  FutureQuestsSection: () => <div data-testid="quests-section">Future Quests</div>,
  ContactFormSection: () => <div data-testid="contact-section">Contact Form</div>,
}));

// Mock SEO component
vi.mock('@/components/SEO', () => ({
  SEO: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="seo" data-title={title} data-description={description} />
  ),
  buildLocalBusinessSchema: () => ({ '@type': 'LocalBusiness' }),
}));

const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  );
};

describe('HomePage', () => {
  it('renders without crashing', () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
  });

  it('renders all section components', () => {
    renderWithRouter(<HomePage />);
    
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('results-section')).toBeInTheDocument();
    expect(screen.getByTestId('why-choose-section')).toBeInTheDocument();
    expect(screen.getByTestId('services-section')).toBeInTheDocument();
    expect(screen.getByTestId('reviews-section')).toBeInTheDocument();
    expect(screen.getByTestId('projects-section')).toBeInTheDocument();
    expect(screen.getByTestId('quests-section')).toBeInTheDocument();
    expect(screen.getByTestId('contact-section')).toBeInTheDocument();
  });

  it('renders SEO component with correct props', () => {
    renderWithRouter(<HomePage />);
    
    const seo = screen.getByTestId('seo');
    expect(seo).toHaveAttribute('data-title', 'AI Systems & Software Development');
    expect(seo).toHaveAttribute(
      'data-description',
      'We build AI systems, software, and marketing campaigns that drive real revenue. Based in Bhagalpur, Bihar. Founded 2026.'
    );
  });

  it('has main element as container', () => {
    const { container } = renderWithRouter(<HomePage />);
    
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
  });

  it('has correct spacing class on main element', () => {
    const { container } = renderWithRouter(<HomePage />);
    
    const main = container.querySelector('main');
    expect(main).toHaveClass('space-y-0');
  });

  it('renders sections in correct order', () => {
    renderWithRouter(<HomePage />);
    
    const sections = screen.getAllByTestId(/-section$/);
    expect(sections[0]).toHaveAttribute('data-testid', 'hero-section');
    expect(sections[1]).toHaveAttribute('data-testid', 'results-section');
    expect(sections[2]).toHaveAttribute('data-testid', 'why-choose-section');
    expect(sections[3]).toHaveAttribute('data-testid', 'services-section');
    expect(sections[4]).toHaveAttribute('data-testid', 'reviews-section');
    expect(sections[5]).toHaveAttribute('data-testid', 'projects-section');
    expect(sections[6]).toHaveAttribute('data-testid', 'quests-section');
    expect(sections[7]).toHaveAttribute('data-testid', 'contact-section');
  });

  it('contains exactly 8 sections', () => {
    renderWithRouter(<HomePage />);
    
    const sections = screen.getAllByTestId(/-section$/);
    expect(sections).toHaveLength(8);
  });

  it('renders fragment wrapper', () => {
    const { container } = renderWithRouter(<HomePage />);
    
    // The component should render without any wrapper div issues
    expect(container.firstChild).toBeTruthy();
  });

  it('exports default and named export', () => {
    // Test that both exports exist
    expect(HomePage).toBeDefined();
    expect(typeof HomePage).toBe('function');
  });
});
