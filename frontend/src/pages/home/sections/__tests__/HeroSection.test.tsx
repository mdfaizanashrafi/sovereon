/**
 * ============================================================================
 * HERO SECTION TESTS
 * ============================================================================
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroSection } from '../HeroSection';
import { MemoryRouter } from 'react-router-dom';

// Wrap component with Router since it uses Link
const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  );
};

describe('HeroSection', () => {
  it('renders hero section', () => {
    renderWithRouter(<HeroSection />);
    expect(screen.getByLabelText('Hero section')).toBeInTheDocument();
  });

  it('displays main headline', () => {
    renderWithRouter(<HeroSection />);
    // Use getAllByText since there are multiple matches
    const headlines = screen.getAllByText(/AI Systems That/i);
    expect(headlines.length).toBeGreaterThan(0);
    expect(screen.getByText(/Drive Real Revenue/i)).toBeInTheDocument();
  });

  it('displays subheadline', () => {
    renderWithRouter(<HeroSection />);
    expect(screen.getByText(/Founded February 2026/i)).toBeInTheDocument();
  });

  it('has badge with company tagline', () => {
    renderWithRouter(<HeroSection />);
    expect(screen.getByText(/Built by engineers. Designed for growth./i)).toBeInTheDocument();
  });

  it('renders CTA buttons with correct links', () => {
    renderWithRouter(<HeroSection />);
    
    const strategyCallButton = screen.getByRole('link', { name: /Book a Free Strategy Call/i });
    expect(strategyCallButton).toHaveAttribute('href', '/contact-us');
    
    const resultsButton = screen.getByRole('link', { name: /See Our Results/i });
    expect(resultsButton).toHaveAttribute('href', '/case-studies');
  });

  it('displays trust indicators', () => {
    renderWithRouter(<HeroSection />);
    
    expect(screen.getByText('Revenue-Focused')).toBeInTheDocument();
    expect(screen.getByText('Technical Founders')).toBeInTheDocument();
    expect(screen.getByText('24/7 Support')).toBeInTheDocument();
  });

  it('renders with correct section element', () => {
    renderWithRouter(<HeroSection />);
    const section = screen.getByLabelText('Hero section');
    expect(section.tagName.toLowerCase()).toBe('section');
  });

  it('has animated background elements', () => {
    const { container } = renderWithRouter(<HeroSection />);
    
    // Check for animated grid background
    const gridBackground = container.querySelector('[class*="bg-[radial-gradient"]');
    expect(gridBackground).toBeInTheDocument();
  });

  it('has floating AI nodes', () => {
    const { container } = renderWithRouter(<HeroSection />);
    
    // Check for floating nodes with animation
    const floatingNodes = container.querySelectorAll('.animate-neural-pulse');
    expect(floatingNodes.length).toBeGreaterThan(0);
  });

  it('has gradient text styling', () => {
    const { container } = renderWithRouter(<HeroSection />);
    
    const gradientText = container.querySelector('.text-gradient');
    expect(gradientText).toBeInTheDocument();
  });

  it('has animation classes for content', () => {
    const { container } = renderWithRouter(<HeroSection />);
    
    // Check for fade-in animations
    const fadeInElements = container.querySelectorAll('.animate-fade-in-up');
    expect(fadeInElements.length).toBeGreaterThan(0);
  });

  it('has delay animation classes', () => {
    const { container } = renderWithRouter(<HeroSection />);
    
    // Check for animation delay classes
    const delayElements = container.querySelectorAll('[class*="animation-delay"]');
    expect(delayElements.length).toBeGreaterThan(0);
  });

  it('is responsive with container classes', () => {
    const { container } = renderWithRouter(<HeroSection />);
    
    const containerElement = container.querySelector('.container');
    expect(containerElement).toBeInTheDocument();
  });

  it('has correct responsive text classes', () => {
    const { container } = renderWithRouter(<HeroSection />);
    
    // Check for responsive text classes
    const responsiveText = container.querySelector('.text-4xl, .sm\\:text-5xl, .md\\:text-6xl');
    expect(responsiveText).toBeInTheDocument();
  });
});
