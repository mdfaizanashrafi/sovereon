/**
 * ============================================================================
 * HOMEPAGE - Main Landing Page
 * ============================================================================
 * 
 * Dynamic homepage with CMS-driven content.
 * Sections are imported from ./home/sections/ for better maintainability.
 * 
 * @author Sovereon Inc. Development Team
 * @since February 2026
 * @version 3.1.0 - Refactored to use section components
 */

import { SEO, buildLocalBusinessSchema } from '@/components/SEO';
import {
  HeroSection,
  ResultsSection,
  WhyChooseUsSection,
  ServicesPreviewSection,
  ReviewsSection,
  CurrentProjectsSection,
  FutureQuestsSection,
  ContactFormSection,
} from './home/sections';

/**
 * Homepage Component
 * Composes all section components into the landing page
 */
export function HomePage() {
  return (
    <>
      <SEO
        title="AI Systems & Software Development"
        description="We build AI systems, software, and marketing campaigns that drive real revenue. Based in Bhagalpur, Bihar. Founded 2026."
        keywords="AI services, software development, digital marketing, Bhagalpur, custom software, mobile apps"
        schema={buildLocalBusinessSchema()}
      />
      <main className="space-y-0">
        <HeroSection />
        <ResultsSection />
        <WhyChooseUsSection />
        <ServicesPreviewSection />
        <ReviewsSection />
        <CurrentProjectsSection />
        <FutureQuestsSection />
        <ContactFormSection />
      </main>
    </>
  );
}

export default HomePage;
